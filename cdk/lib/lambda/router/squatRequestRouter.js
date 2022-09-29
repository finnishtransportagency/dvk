function handler(event) {
  var request = event.request;

  // Response when request or request URI missing
  if (!request || !request.uri) {
    return {
      statusCode: 404,
      statusDescription: 'Not found',
    };
  }

  // Default index pages do not work on subdirectories such as /squat/
  // and Ionic language pathing all to index.html
  if (request.uri === '/squat/' || request.uri === '/squat/en' || request.uri === '/squat/sv' || request.uri === '/squat/fi') {
    request.uri = '/squat/index.html';
  }

  return request;
}
