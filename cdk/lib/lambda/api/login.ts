import { getCloudFrontPrivateKey, getCloudFrontPublicKeyId } from '../environment';
import { getSignedCookies } from '@aws-sdk/cloudfront-signer';
import { ALBResult } from 'aws-lambda';

const cloudFrontDnsName = process.env.CLOUDFRONT_DNSNAME;

export const handler = async (): Promise<ALBResult> => {
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

  return {
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
};
