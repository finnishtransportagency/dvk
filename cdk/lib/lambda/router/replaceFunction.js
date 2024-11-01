function handler(event) {
  let request = event.request;
  let uri = request.uri;
  request.uri = uri.replace('/${REPLACE_PATH}/', '/');
  return request;
}
