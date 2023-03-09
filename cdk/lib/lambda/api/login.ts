import { getCloudFrontPrivateKey, getCloudFrontPublicKeyId, getCognitoUrl } from '../environment';
import { getSignedCookies } from '@aws-sdk/cloudfront-signer';
import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import JWT, { JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';

const cloudFrontDnsName = process.env.CLOUDFRONT_DNSNAME;
let cachedKeys: Record<string, string>;

// Fetch JWK's from Cognito or cache
const getPublicKeys = async (issuerUrl: string) => {
  if (!cachedKeys) {
    cachedKeys = {};
    const publicKeys = await axios.get(issuerUrl + '/.well-known/jwks.json');
    for (const key of publicKeys.data.keys) {
      cachedKeys[key.kid] = jwkToPem(key);
    }
    return cachedKeys;
  } else {
    return cachedKeys;
  }
};

export const validateJwtToken = async (token: string | undefined, dataToken: string): Promise<JwtPayload | undefined> => {
  if (!token) {
    log.debug('IAM JWT Token missing');
    return;
  }
  // Split token into parts
  const tokenParts = token.split('.');
  if (tokenParts.length < 2) {
    log.error('Invalid token');
    return;
  }

  // Parse header & payload from token parts
  const tokenHeader = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString('utf-8'));
  const tokenPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));

  // Fetch public keys from Cognito
  const publicKeys = await getPublicKeys(tokenPayload.iss);
  const publicKey = publicKeys[tokenHeader.kid];
  if (!publicKey) {
    log.debug('Public key not found');
    return;
  }

  // Verify token
  const result = JWT.verify(token, publicKey, { issuer: await getCognitoUrl() }) as JwtPayload;
  if (!result) {
    log.error('Failed to verify JWT');
    return;
  }

  // Check use access
  if (result.token_use !== 'access') {
    log.error('Invalid token use');
    return;
  }

  // Return decoded data token
  return JWT.decode(dataToken.replace(/=/g, '')) as JwtPayload;
};

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  try {
    let jwtToken;
    if (event.multiValueHeaders) {
      log.info({ headers: event.multiValueHeaders }, 'Request headers');
      const token = event.multiValueHeaders['x-iam-accesstoken'];
      const data = event.multiValueHeaders['x-iam-data'];
      if (token && data) {
        jwtToken = await validateJwtToken(token[0], data[0]);
      }
    }
    log.info('JwtToken: %o', jwtToken);
    // TODO: comment out once token received from ALB
    /*if (!jwtToken) {
      return {
        statusCode: 403,
      };
    }*/
    const cloudFrontPolicy = JSON.stringify({
      Statement: [
        {
          Resource: `https://${cloudFrontDnsName}/*`,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': Math.floor(new Date().getTime() / 1000) + 3600,
            },
          },
        },
      ],
    });

    const cookie = getSignedCookies({
      url: cloudFrontDnsName as string,
      privateKey: await getCloudFrontPrivateKey(),
      keyPairId: await getCloudFrontPublicKeyId(),
      policy: cloudFrontPolicy,
    });

    const setCookieAttributes = `; Domain=${cloudFrontDnsName}; Path=/; Secure; HttpOnly; SameSite=Lax`;

    const response: ALBResult = {
      statusCode: 302,
      multiValueHeaders: {
        Location: [`https://${cloudFrontDnsName}/yllapito/index.html`],
        'Set-Cookie': [
          `CloudFront-Key-Pair-Id=${cookie['CloudFront-Key-Pair-Id']}${setCookieAttributes}`,
          `CloudFront-Policy=${cookie['CloudFront-Policy']}${setCookieAttributes}`,
          `CloudFront-Signature=${cookie['CloudFront-Signature']}${setCookieAttributes}`,
        ],
      },
    };
    log.debug(response, 'Login response');
    return response;
  } catch (e) {
    log.error('Getting signed cookies failed: %s', e);
    return { statusCode: 500, body: String(e) };
  }
};
