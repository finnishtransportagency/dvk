function handler(event) {
  var request = event.request;
  var uri = request.uri;
  request.uri = uri.replace('/${REPLACE_PATH}/', '/');
  return request;
}
