function handler(event) {
  //NB : Use var here as cloudfront supports only 5.1
  var authHeaders = event.request.headers.authorization;
  var authString = 'Basic ${AUTH_STRING}';

  if (authHeaders && authHeaders.value === authString) {
    return event.request;
  }

  var response = {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': { value: 'Basic' },
    },
  };
  return response;
}
