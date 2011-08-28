process.chdir(__dirname);

try {
  var nko = require('nko')('NNlLWzf6EhahtxjJ'); 
} catch (err) {
  console.log('Warning: unable to load \'nko\' module.');
}

var debug = process.argv[3] ? true : false,
    port = process.argv[2] ? process.argv[2] : 80,
    
    rooms = [],
    drawings = [],
    num_of_lines = [],
    
    // users[id] holds .name, .color, .room, .needs_full_update for a user
    users = [],
    // user_update_buffer[id] holds list of objects to be sent to use with that id via /update
    user_update_buffer = [], 
    // room_user_ids[room name] holds a list of user ids for users in that room
    room_user_ids = {},
    // room_data[room name] holds all the line data for a room
    room_data = [],
    
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
      fs.readFile('index.html', function(err, data) {
        res.writeHead(200, lib.html);
        res.end(data);
      });
    break;

    case '/get-a-room':
      var new_room = lib.genRoom();
      if ( typeof room_user_ids[room] === 'undefined' ) {
        room_user_ids[new_room] = [];
        room_data[new_room] = [];
      }
      res.writeHead(200, lib.plain);
      res.end(new_room);
      console.log('created room: ' + new_room);
    break;

    case '/join':
      var get = url.parse(req.url).query.toString().split('&'),
          name = get[0].replace('name=', ''),
          room = get[1].replace('room=', '');
          id = get[2].replace('id=', '');
      users[id] = {
        name: name,
        color: lib.genColor(),
        room: room,
        needs_full_update: true
      };
      //TODO: check that room exists
      console.log(room_user_ids)
      room_user_ids[room].push(id);
      user_update_buffer[id] = [];
      res.writeHead(200, lib.plain);
      res.end(users[id].color);
      console.log('added user ' + users[id].name + ' with id ' + id);
    break;

    case '/draw':
      var id = qs.parse(url.parse(req.url).query.toString()).id;
      var data = JSON.parse(qs.parse(url.parse(req.url).query.toString()).data).lines;
      
      console.log('draw from id ' + id + ' with line data: ' + data);
      
      var color = users[id].color;
      var room = users[id].room;

      // json to send to other clients
      var line_data = { lines: data, color: color };
      
      // figure out who to send the new line data to
      for (i in room_user_ids[room]) {
        var other_id = room_user_ids[room][i];
        if (other_id !== id) {
          // we have a user which needs this data
          user_update_buffer[other_id].push(line_data);
        }
      }
      // always save the data as well
      room_data[room].push(line_data);
      
      //TODO: ink level
      
      res.writeHead(200, lib.plain);
      res.end("success");
    break;

    case '/update':
      var id = url.parse(req.url).query.toString().replace('id=', '');
      console.log('update request from user id ' + id);
      // TODO: check validity of id
      if (users[id].needs_full_update === true) {
        // the user needs all the room data
        users[id].needs_full_update = false;
        user_update_buffer[id] = user_update_buffer[id].concat(room_data[users[id].room]);
      }
      if (user_update_buffer[id].length !== 0) {
        // there are pending updates to send
        res.writeHead(200, lib.plain);
        res.end(JSON.stringify(user_update_buffer[id]));
        user_update_buffer[id] = []; // empty the buffer
      } else {
        //TODO: replace this with long polling
        res.writeHead(200, lib.plain);
        res.end(JSON.stringify([])); // send empty list
      }
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
