function handler(event) {
  let request = event.request;
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }
  if (
    request.uri === '/esikatselu/' ||
    request.uri === '/esikatselu' ||
    request.uri.startsWith('/esikatselu/satamat') ||
    request.uri.startsWith('/esikatselu/kortit')
  ) {
    request.uri = '/esikatselu/index.html';
  }
  return request;
}
