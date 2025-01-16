function handler(event) {
  //NB : Use var here as cloudfront supports only 5.1
  var request = event.request;
  var uri = request.uri;
  request.uri = uri.replace('/${REPLACE_PATH}/', '/');
  return request;
}
