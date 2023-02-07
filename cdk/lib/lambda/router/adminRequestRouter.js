function handler(event) {
  var request = event.request;
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }
  var regex = /[\.]/g;
  if (request.uri === '/yllapito/' || request.uri === '/yllapito' || !request.uri.match(regex)) {
    request.uri = '/yllapito/index.html';
  }
  return request;
}
