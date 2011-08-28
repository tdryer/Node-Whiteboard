process.chdir(__dirname);

try {
  var nko = require('nko')('NNlLWzf6EhahtxjJ'); 
} catch (err) {}

var debug = process.argv[3] ? true : false,
    port = process.argv[2] ? process.argv[2] : 80,
    
    // users[id] holds .name, .color, .room, for a user
    users = {},
    // user_update_buffer[id] holds list of objects to be sent to use with that id via /update
    user_update_buffer = {}, 
    // room_user_ids[room name] holds a list of user ids for users in that room
    room_user_ids = {},
    // room_data[room name] holds all the line data for a room
    room_data = {},
    // room_ink[room name] holds the number of lines used by a room (can be recalculated)
    room_ink = {},
    // update_requests[id] holds the last update response object from that user, or undefined
    update_requests = {};
    
    lib = require('./helpers'),
    gzip = require('./gzip'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    qs = require('querystring'),
    fs = require('fs');

function get_room_usernames(room) {
  // return a list of username for everyone in a room
  var usernames = [], i;
  for (i in room_user_ids[room]) {
    usernames.push({name: users[room_user_ids[room][i]].name, color: users[room_user_ids[room][i]].color});
  }
  return usernames;
}

function refresh_usernames(room) {
  // send a username update to everyone in the given room
  var usernames = get_room_usernames(room);
  // update user list on the client
  for (i in room_user_ids[room]) {
    var other_id = room_user_ids[room][i];
    user_update_buffer[other_id].push({type: 'users', users: usernames});
  }
}

function refresh_ink_room(room) {
console.log('refreshing ink for room: '+room);
  // send ink update to everyone in the given room
  var usernames = get_room_usernames(room);
  for (i in room_user_ids[room]) {
    var other_id = room_user_ids[room][i];
    refresh_ink(other_id, room);
  }
}

function refresh_ink(id, room) {
  // refresh ink for one user id
  user_update_buffer[id].push({type: 'ink', ink: room_ink[room] / lib.MAX_INK});
}

function clear_room(room) {
  // delete lines for a room and send clear messages to clients
  room_data[room] = [];
  for (i in room_user_ids[room]) {
    var id = room_user_ids[room][i];
    user_update_buffer[id].push({type: 'clear'});
  }
}

function full_update(id) {
  // send user a full update of all the line data for the room they are in
  user_update_buffer[id] = user_update_buffer[id].concat(room_data[users[id].room]);
}

function respond_to_update(id, res) {
  // make sure res is defined TODO: better fix
  if (res === undefined) { return; }
  // respond to the user id's /update request with the given response object
  gzip(JSON.stringify(user_update_buffer[id]), function(err, data){
    res.writeHead(200, lib.plain_gzip);
    res.end(data);
  });
  user_update_buffer[id] = []; // empty the buffer
}

function check_polling_updates() {
  // for all polling update requests, respond to them if updates are ready
  for (id in update_requests) {
    var res = update_requests[id];
    if (user_update_buffer[id] !== undefined && user_update_buffer[id].length !== 0) {
      // data is ready
      respond_to_update(id, res);
      update_requests[id] = undefined; // no longer polling
    }
  }
}

var app = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  switch (uri) {

    case '/':
      try {
        var room_name = url.parse(req.url).query.toString().replace('room=', '');
        if ( typeof room_user_ids[room_name] === 'undefined' ) {
          room_user_ids[room_name] = [];
          room_data[room_name] = [];
        }
      } catch(err) {}
      fs.readFile('index.html', function(err, data) {
        gzip(data, function(err, data){
          res.writeHead(200, lib.html);
          res.end(data);
        });
      });
    break;

    case '/get-a-room':
      var new_room = lib.genRoom();
      if ( typeof room_user_ids[new_room] === 'undefined' ) {
        room_user_ids[new_room] = [];
        room_data[new_room] = [];
        room_ink[new_room] = 0;
      }
      gzip(new_room, function(err, new_room){
        res.writeHead(200, lib.plain_gzip);
        res.end(new_room);
      });
      console.log('created room: ' + new_room);
    break;

    case '/join':
      var get = url.parse(req.url).query.toString().split('&'),
          name = get[0].replace('name=', ''),
          room = get[1].replace('room=', ''),
          id = get[2].replace('id=', '');
      users[id] = {
        name: name,
        color: lib.genColor(),
        room: room,
      };
      //TODO: check that room exists
      room_user_ids[room].push(id);
      user_update_buffer[id] = [];
      
      full_update(id); // send new user all existing line data
      refresh_usernames(room);
      refresh_ink(id, room);
      
      check_polling_updates() // polling users may need updates now
      
      res.writeHead(200, lib.plain);
      res.end(users[id].color);
      console.log('added user ' + users[id].name + ' with id ' + id);
    break;

    case '/draw':
      try {
        var id = qs.parse(url.parse(req.url).query.toString()).id;
        var data = JSON.parse(qs.parse(url.parse(req.url).query.toString()).data).lines;
        
        console.log('draw from id ' + id + ' with line data: ' + data);
        
        var color = users[id].color;
        var room = users[id].room;

        // ink
        var remaining_ink = lib.MAX_INK - room_ink[room];
        data = data.slice(0, remaining_ink * 4);
        
        // if there are lines still allowed after checking ink level
        if (data !== []) {
          // json to send to other clients
          var line_data = { type: "lines", lines: data, color: color }, i;
          
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
          // send the new ink level out
          room_ink[room] += data.length / 4;
          refresh_ink_room(room);
          
          check_polling_updates() // polling users may need updates now
        }
        
        res.writeHead(200, lib.plain);
        res.end("success");
      } catch(err) {}
    break;
    
    case '/update':
      try {
        var id = url.parse(req.url).query.toString().replace('id=', '');
        console.log('update request from user id ' + id);
        
        if (user_update_buffer[id].length !== 0) {
          // respond now
          respond_to_update(id, res);
          // no request pending
          update_requests[id] = undefined;
        } else {
          // long poll the request
          update_requests[id] = res
        }
      } catch (err) {}
    break;

    case '/clear':
      try {
        var room_name = url.parse(req.url).query.toString().replace('room=', ''), i;
        clear_room(room_name);
        // clear ink level
        room_ink[room_name] = 0;
        refresh_ink_room(room_name);
        
        check_polling_updates() // polling users may need updates now
        
        res.writeHead(200, lib.plain);
        res.end('1');
      } catch (err) {}
    break;

    case '/leave':
      try {
        var id = qs.parse(url.parse(req.url).query.toString()).id;
        // remove the user from relevant data structures
        var room = users[id].room;
        room_user_ids[room].splice(room_user_ids[room].indexOf(id), 1);
        delete users[id];
        delete user_update_buffer[id];
        // send updated username list to users in the same room
        refresh_usernames(room);
        check_polling_updates() // polling users may need updates now
      } catch(err) {
        
      }
    break;

    default:
      var file = path.join(process.cwd(), uri), extension;
      path.exists(file, function(exists) {
        if (exists) {
          extension = file.lastIndexOf('.') < 0 ? '' : file.substring(file.lastIndexOf('.'));
          fs.readFile(file, function(err, data) {
            gzip(data, function(err, data){
              if ( extension === '.css' ) {
                res.writeHead(200, lib.css);
              } else if (extension === '.js') {
                res.writeHead(200, lib.js);
              } else if (extension === '.png') {
                res.writeHead(200, lib.png);
              }
              res.end(data);
            });
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
