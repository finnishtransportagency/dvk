import { getCloudFrontPrivateKey, getCloudFrontPublicKeyId, getCognitoUrl, isPermanentEnvironment } from '../environment';
import { getSignedCookies } from '@aws-sdk/cloudfront-signer';
import { ALBEvent, ALBResult, AppSyncResolverEvent } from 'aws-lambda';
import { auditLog, log } from '../logger';
import JWT, { JwtPayload } from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import axios from 'axios';
import { OperationError } from '../../../graphql/generated';

const cloudFrontDnsName = process.env.CLOUDFRONT_DNSNAME;
export const ADMIN_ROLE = 'DVK_yllapito';
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

const validateJwtToken = async (token: string | undefined, dataToken: string): Promise<JwtPayload | undefined> => {
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
  log.debug({ jwtToken: result }, 'JwtToken');
  // Return decoded data token
  return JWT.decode(dataToken.replace(/=/g, '')) as JwtPayload;
};

function parseRoles(roles: string): string[] {
  return roles
    ? roles
        .replace('\\', '')
        .split(',')
        .map((s) => {
          const s1 = s.split('/').pop();
          if (s1) {
            return s1;
          }
          // tsc fails if undefined is returned here
          return '';
        })
        .filter((s) => s?.startsWith('DVK_'))
    : [];
}

export type CurrentUser = {
  firstName: string;
  lastName: string;
  uid: string;
  roles: string[];
};

export class IllegalAccessError extends Error {
  constructor() {
    super(OperationError.NoPermissions);
  }
}

export async function getOptionalCurrentUser(event: ALBEvent | AppSyncResolverEvent<unknown>, checkRoles = true): Promise<CurrentUser | undefined> {
  let jwtDataToken;
  if ('multiValueHeaders' in event && event.multiValueHeaders) {
    log.debug({ headers: event.multiValueHeaders }, 'Request headers');
    const token = event.multiValueHeaders['x-iam-accesstoken'];
    const data = event.multiValueHeaders['x-iam-data'];
    if (token && data) {
      jwtDataToken = await validateJwtToken(token[0], data[0]);
    }
  } else if ('request' in event && event.request.headers) {
    log.debug({ headers: event.request.headers }, 'Request headers');
    const token = event.request.headers['x-iam-accesstoken'];
    const data = event.request.headers['x-iam-data'];
    if (token && data) {
      jwtDataToken = await validateJwtToken(token, data);
    }
  }
  log.debug({ jwtDataToken }, 'JwtDataToken');
  const roles = jwtDataToken ? parseRoles(jwtDataToken['custom:rooli']) : [];
  if (jwtDataToken && (roles.length > 0 || checkRoles === false)) {
    return {
      uid: jwtDataToken['custom:uid'] as string,
      firstName: jwtDataToken['custom:etunimi'] as string,
      lastName: jwtDataToken['custom:sukunimi'] as string,
      roles,
    };
  }
  if (!isPermanentEnvironment()) {
    return {
      uid: 'K123456',
      firstName: 'Developer',
      lastName: 'X',
      roles: [ADMIN_ROLE],
    };
  }
  return undefined;
}

export async function getCurrentUser(event: ALBEvent | AppSyncResolverEvent<unknown>): Promise<CurrentUser> {
  const user = await getOptionalCurrentUser(event);
  if (user) {
    return user;
  } else {
    throw new IllegalAccessError();
  }
}

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const currentUser = await getOptionalCurrentUser(event, false);
    if (!currentUser || currentUser.roles.length === 0) {
      auditLog.info({ user: currentUser ? currentUser.uid : 'unknown' }, 'Login failed');
      return {
        statusCode: 403,
      };
    }
    const cloudFrontPolicy = JSON.stringify({
      Statement: [
        {
          Resource: `https://${cloudFrontDnsName}/*`,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': Math.floor(new Date().getTime() / 1000) + 60 * 60 * 8,
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
    auditLog.info({ user: currentUser.uid }, 'Login succeeded');
    log.debug(response, 'Login response');
    return response;
  } catch (e) {
    log.error('Getting signed cookies failed: %s', e);
    return { statusCode: 500, body: String(e) };
  }
};
