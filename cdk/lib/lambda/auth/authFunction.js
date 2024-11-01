function handler(event) {
  let authHeaders = event.request.headers.authorization;
  let authString = 'Basic ${AUTH_STRING}';

  if (authHeaders && authHeaders.value === authString) {
    return event.request;
  }

  let response = {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': { value: 'Basic' },
    },
  };
  return response;
}
