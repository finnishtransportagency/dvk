function handler(event) {
  var request = event.request;
  var uri = request.uri;
  request.uri = uri.replace('/geotiff/', '/');
  return request;
}
