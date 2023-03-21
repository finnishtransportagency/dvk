import { ALBEvent, ALBResult } from 'aws-lambda';
import { log } from '../logger';
import { getOptionalCurrentUser } from './login';

const cloudFrontDnsName = process.env.CLOUDFRONT_DNSNAME;

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  try {
    const currentUser = await getOptionalCurrentUser(event);
    const setCookieAttributes = `; Domain=${cloudFrontDnsName}; Path=/; Secure; HttpOnly; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    if (!currentUser) {
      return {
        statusCode: 403,
        multiValueHeaders: {
          'Set-Cookie': [
            `CloudFront-Key-Pair-Id=deleted ${setCookieAttributes}`,
            `CloudFront-Policy=deleted ${setCookieAttributes}`,
            `CloudFront-Signature=deleted ${setCookieAttributes}`,
          ],
        },
      };
    }
    const response: ALBResult = {
      statusCode: 302,
      multiValueHeaders: {
        Location: [`https://${cloudFrontDnsName}/sso/logout?auth=1`],
        'Set-Cookie': [
          `CloudFront-Key-Pair-Id=deleted${setCookieAttributes}`,
          `CloudFront-Policy=deleted${setCookieAttributes}`,
          `CloudFront-Signature=deleted${setCookieAttributes}`,
        ],
      },
    };
    log.debug(response, 'Logout response');
    return response;
  } catch (e) {
    log.error('Logging out failed: %s', e);
    return { statusCode: 500, body: String(e) };
  }
};
