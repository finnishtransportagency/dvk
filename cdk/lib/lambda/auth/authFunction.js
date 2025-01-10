function handler(event) {
  const authHeaders = event.request.headers.authorization;
  const authString = 'Basic ${AUTH_STRING}';

  if (authHeaders && authHeaders.value === authString) {
    return event.request;
  }

  const response = {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': { value: 'Basic' },
    },
  };
  return response;
}
