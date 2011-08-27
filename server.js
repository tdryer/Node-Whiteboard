// boss
process.chdir(__dirname);

// arguments
var debug = process.argv[3] ? process.argv[3] : false;
var port = process.argv[2] ? process.argv[2] : 80;

var users = [];

function genColor() {
  return 'green';
}

// modules
var http = require('http')
  , url = require('url')
  , path = require('path')
  , fs = require('fs');
  //, nko = require('nko')('NNlLWzf6EhahtxjJ');

var app = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  
  switch (uri) {
    case '/':
      fs.readFile('index.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data);
      });
    break;
    case '/join':
      var name = url.parse(req.url).query.toString().replace('name=', '');
      users[name] = {name: name, color: genColor(), coord: []};
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(users[name].color);
      console.log(users);
    break;
    case '/draw':
      var name = url.parse(req.url).query.toString().replace('name=', '');
      users[name].coord.push('asdf');
    break;
    case '/users':
      res.writeHead(200, {'Content-Type': 'text/plain'});
      var cur_users = [];
      for (var i in users) {
        cur_users.push(users[i].name);
      }
      res.end(JSON.stringify(cur_users));
    break;
    default:
      var file = path.join(process.cwd(), uri);
      path.exists(file, function(exists) {
        if (exists) {
          var extension = file.lastIndexOf('.') < 0 ? '' : file.substring(file.lastIndexOf('.'));
          fs.readFile(file, function(err, data) {
            if (extension === '.css') {
              res.writeHead(200, {'Content-Type': 'text/css'});
            } else if (extension === '.js') {
              res.writeHead(200, {'Content-Type': 'application/javascript'});
            }
            res.end(data);
          });
        }
      });
    break;
  }

});

//app.listen(port, function() {
//  console.log('Server listening on port ' + port + '.');
//});

app.listen(port, function() {
  console.log('Ready');
  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0)
  require('fs').stat(__filename, function(err, stats) {
    if (err) return console.log(err)
    process.setuid(stats.uid);
  });
});
