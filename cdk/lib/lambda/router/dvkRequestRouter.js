// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-custom-methods.html
import cf from 'cloudfront';
const kvsId = 'KEY_VALUE_STORE_ID_PLACEHOLDER'; // Replace with actual KVS ID in cdk import
const keyvaluestore = cf.kvs(kvsId);

async function handler(event) {
  const request = event.request;

  // Response when request or request URI missing
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }

  // Check if maintenance mode is on, value is set to 'true' via aws cli when needed
  try {
    const isMaintenanceMode = await keyvaluestore.get('maintenance-mode', { format: 'string'});
    if (isMaintenanceMode == 'true') {
      request.uri = '/maintenance.html';
    }
  } catch (error) {
    console.error('Error getting maintenance mode value:', error);
  }

  // Default index pages do not work on s3 subdirectories -> all to /index.html
  if (
    request.uri === '/vaylakortti' ||
    request.uri === '/vaylakortti/' ||
    request.uri.startsWith('/vaylakortti/kortit') ||
    request.uri.startsWith('/vaylakortti/turvalaiteviat') ||
    request.uri.startsWith('/vaylakortti/merivaroitukset')
  ) {
    request.uri = '/vaylakortti/index.html';
  }

  return request;
}
