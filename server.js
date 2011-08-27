process.chdir(__dirname);
var lib = require('./helpers'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    nko = 'hi'; // require('nko')('NNlLWzf6EhahtxjJ');
var debug = process.argv[3] ? true : false,
    port = process.argv[2] ? process.argv[2] : 80,
    users = [],
    rooms = [];

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
      users[name] = {
        name: name,
        color: lib.genColor()
      };
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(users[name].color);
      debug && console.log(users);
    break;

    case '/draw':
      var drawer = url.parse(req.url).query.toString().replace('name=', '');
    break;

    case '/users':
      var i, cur_users = [];
      res.writeHead(200, {'Content-Type': 'text/plain'});
      for (i in users) {
        cur_users.push(users[i].name);
      }
      res.end(JSON.stringify(cur_users));
    break;

    default:
      var file = path.join(process.cwd(), uri), extension;
      path.exists(file, function(exists) {
        if (exists) {
          extension = file.lastIndexOf('.') < 0 ? '' : file.substring(file.lastIndexOf('.'));
          fs.readFile(file, function(err, data) {
            if ( extension === '.css' ) {
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

app.listen(port, function() {
  console.log('Server listening on port ' + port + '.');
  try {
    // if run as root, downgrade to the owner of this file
    if (process.getuid() === 0) {
      fs.stat(__filename, function(err, stats) {
        if (err) {
          console.log(err);
        }
        process.setuid(stats.uid);
      });
    }
  } catch (err) {
    console.log('poor windows');
  }
});