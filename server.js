// arguments
var debug = process.argv[3] ? process.argv[3] : false;
var port = process.argv[2] ? process.argv[2] : 80;

// modules
var http = require('http')
  , url = require('url')
  , nko = require('nko')('NNlLWzf6EhahtxjJ');

var app = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  
  switch (uri) {
  
    default:
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('Hello, World');
  }

});

app.listen(port, function() {
  console.log('Server listening on port ' + port + '.');
});
