process.chdir(__dirname);
var debug = process.argv[3] ? true : false,
    port = process.argv[2] ? process.argv[2] : 80,
    users = [],
    rooms = [],
    lib = require('./helpers'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    nko = 'hi'; // require('nko')('NNlLWzf6EhahtxjJ');
var app = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  switch (uri) {

    case '/':
      fs.readFile('index.html', function(err, data) {
        res.writeHead(200, lib.html);
        res.end(data);
      });
    break;

    case '/room':
      var new_room = lib.genRoom();
      if ( typeof rooms[new_room] === 'undefined' ) {
        rooms[new_room] = [];
      } else {
        
      }
      res.writeHead(200, lib.plain);
      res.end(new_room);
      debug && console.log(rooms);
    break;

    case '/join':
      var get = url.parse(req.url).query.toString().split('&'),
          name = get[0].replace('name=', ''),
          room = get[1].replace('room=', '');
      debug && console.log(name);
      debug && console.log(room);
      users[name] = {
        name: name,
        color: lib.genColor()
      };
      debug && console.log(users[name].color);
      rooms[room].push(users[name]);
      res.writeHead(200, lib.plain);
      res.end(users[name].color);
      debug && console.log(users);
      debug && console.log(rooms);
    break;

    case '/users':
      var room_name = url.parse(req.url).query.toString().replace('room=', '');
      res.writeHead(200, lib.plain);
      console.log(JSON.stringify(rooms[room_name]));
      res.end(JSON.stringify(rooms[room_name]));
    break;

    case '/draw':
      console.log(url.parse(req.url).query);
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