function handler(event) {
  let request = event.request;

  // Response when request or request URI missing
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }

  // Default index pages do not work on subdirectories such as /squat/
  if (request.uri === '/squat/' || request.uri === '/squat') {
    request.uri = '/squat/index.html';
  }

  return request;
}
