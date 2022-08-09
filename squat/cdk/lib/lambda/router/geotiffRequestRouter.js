function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var authHeaders = event.request.headers.authorization;
  var authString = 'Basic ${AUTH_STRING}';
  // Authorized
  if (authHeaders && authHeaders.value === authString) {
    // Response when request or request URI missing
    if (!request || !request.uri) {
      return {
        statusCode: 404,
        statusDescription: 'Not found',
      };
    }
    request.uri = uri.replace('/geotiff/', '/');
    return request;
  }

  // Unauthorized
  return {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': { value: 'Basic' },
    },
  };
}
