process.chdir(__dirname);

try {
  var nko = require('nko')('NNlLWzf6EhahtxjJ'); 
} catch (err) {
  console.log('Warning: unable to load \'nko\' module.');
}

var debug = process.argv[3] ? true : false,
    port = process.argv[2] ? process.argv[2] : 80,
    users = [],
    rooms = [],
    drawings = [],
    num_of_lines = [],
    lib = require('./helpers'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    qs = require('querystring'),
    fs = require('fs');

var app = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  switch (uri) {

    case '/':
      try {
        var room_name = url.parse(req.url).query.toString().replace('room=', '');
        if ( typeof rooms[room_name] === 'undefined' ) {
          rooms[room_name] = [];
          drawings[room_name] = [];
          num_of_lines[room_name] = 0;
        }
      } catch(err) {}
      fs.readFile('index.html', function(err, data) {
        res.writeHead(200, lib.html);
        res.end(data);
      });
    break;

    case '/get-a-room':
      var new_room = lib.genRoom();
      if ( typeof rooms[new_room] === 'undefined' ) {
        rooms[new_room] = [];
        drawings[new_room] = [];
        num_of_lines[new_room] = 0;
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

    case '/draw':
      // recieves new line segments from a client
      var data = JSON.parse(qs.parse(url.parse(req.url).query.toString()).data);
      var room = data.room;
      var lines = data.lines;
      var name = data.name;
      var remaining_ink = lib.MAX_INK - num_of_lines[room];
      lines = lines.slice(0, remaining_ink * 4); // don't add more lines that the ink limit allows
      if (lines !== []) {
        drawings[room].push({lines: lines, color: users[name].color});
        num_of_lines[room] += lines.length / 4;
        console.log("got " + lines.length / 4 + " lines for " + room + ' from ' + name);
      }
      res.writeHead(200, lib.plain);
      res.end("success");
    break;

    case '/update':
      var room_name = url.parse(req.url).query.toString().replace('room=', '');
      var data = { lines: drawings[room_name], 
                   users: rooms[room_name], 
                   ink: num_of_lines[room_name] / lib.MAX_INK };
      res.writeHead(200, lib.plain);
      res.end(JSON.stringify(data));
    break;

    case '/clear':
      var room_name = url.parse(req.url).query.toString().replace('room=', '');
      drawings[room_name] = [];
      res.writeHead(200, lib.plain);
      res.end('clear');
    break;

    case '/leave':
      var get = url.parse(req.url).query.toString().split('&'),
          name = get[0].replace('name=', ''),
          room = get[1].replace('room=', ''),
          index;
      if ( rooms[room].length === 1 ) {
        rooms[room] = [];
      } else {
        console.log(rooms[room].length);
        for ( var i in rooms[room] ) {
          if (rooms[room][i].name == name) {
            index = i;
          }
        }
        rooms[room].splice(index, 1);
      }
      users[name] = null;
    break;

    default:
      var file = path.join(process.cwd(), uri), extension;
      path.exists(file, function(exists) {
        if (exists) {
          extension = file.lastIndexOf('.') < 0 ? '' : file.substring(file.lastIndexOf('.'));
          fs.readFile(file, function(err, data) {
            if ( extension === '.css' ) {
              res.writeHead(200, lib.css);
            } else if (extension === '.js') {
              res.writeHead(200, lib.js);
            } else if (extension === '.png') {
              res.writeHead(200, lib.png);
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
    // if running as root, downgrade to the owner of this file
    if (process.getuid() === 0) {
      fs.stat(__filename, function(err, stats) {
        if (err) {
          console.log(err);
        }
        process.setuid(stats.uid);
      });
    }
  } catch (err) {
    // poor windows
  }
});
