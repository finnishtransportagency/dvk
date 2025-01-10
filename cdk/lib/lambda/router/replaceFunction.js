function handler(event) {
  const request = event.request;
  const uri = request.uri;
  request.uri = uri.replace('/${REPLACE_PATH}/', '/');
  return request;
}
