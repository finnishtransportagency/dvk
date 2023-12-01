function handler(event) {
  var request = event.request;
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }
  if (request.uri === '/esikatselu/' || request.uri === '/esikatselu' || request.uri.startsWith('/esikatselu/satama') || request.uri.startsWith('/esikatselu/vaylakortti')) {
    request.uri = '/esikatselu/index.html';
  }
  return request;
}
