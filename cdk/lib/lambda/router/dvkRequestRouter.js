function handler(event) {
  let request = event.request;

  // Response when request or request URI missing
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
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
