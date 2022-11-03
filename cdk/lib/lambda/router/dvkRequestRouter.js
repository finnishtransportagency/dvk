function handler(event) {
  var request = event.request;

  // Response when request or request URI missing
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }

  // Default index pages do not work on s3 subdirectories -> all to /index.html
  if (request.uri === '/vaylakortit' || request.uri.startsWith('/vaylakortit/')) {
    request.uri = '/index.html';
  }

  return request;
}
