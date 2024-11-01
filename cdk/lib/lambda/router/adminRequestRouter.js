function handler(event) {
  //NB : Use var here as cloudfront supports only 5.1
  var request = event.request;
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }
  if (
    request.uri === '/yllapito/' ||
    request.uri === '/yllapito' ||
    request.uri.startsWith('/yllapito/satama') ||
    request.uri.startsWith('/yllapito/vaylakortti')
  ) {
    request.uri = '/yllapito/index.html';
  }
  return request;
}
