function urldecode(str) {
  return unescape(str.replace(/\+/g, ' '));
}
function clearCanvas(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
}
function update_users(room, data) {
  var i;
  $('#users').html(room + ': ');
  for ( i in data ) {
    $('#users').append('<span style="color: ' + data[i].color + ';">' + data[i].name + '</span> ');
  }
}
function update_whiteboard(context, data) {
  while ( data.length > 0 ) {
    var obj = data.pop();
    var color = obj.color;
    var lines = obj.lines;
    var i, j, x, y;
    for ( j = 0; j < lines.length; j += 4) {
      context.beginPath();
      context.lineTo(lines[j], lines[j+1]);
      context.lineTo(lines[j+2], lines[j+3]);
      context.strokeStyle = color;
      context.stroke();
      context.closePath();
    }
  }
}
function update(room, context, canvas) {
  $.getJSON('/update', {room: room}, function(data) {
    update_users(room, data.users);
    update_whiteboard(context, data.lines);
  });
}
function url_parameter(name) {
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (!results) { return 0; }
  return results[1] || 0;
}
function canvas_mouse_pos(event, canvas) {
  // for a mouse event, return the mouse position relative to the canvas
  return { x: event.pageX - canvas.offset().left, 
           y: event.pageY - canvas.offset().top };
}

function go(name, room, color) {
  var canvas = $('#canvas');
  var context = canvas.get(0).getContext('2d');
  var mouse_down = false;
  var last_x = -1, last_y = -1; // start of the current line segment
  var line_buffer = []; // lines waiting to be sent to server
  function send_line_segments () {
    // send new line segments to the server and empty the buffer
    // do nothing if there are no lines to send
    if (line_buffer.length === 0) {
      return;
    }
    var data = {};
    data.room = room;
    data.lines = line_buffer;
    data.name = name;
    var sent_length = line_buffer.length; // number of entries we try to send
    $.get('/draw', {data: JSON.stringify(data)}, function() {
      // success, clear the line buffer of lines which were sent
      // this prevents lines drawn during the request from being lost
      line_buffer = line_buffer.slice(sent_length, line_buffer.length);
    });
  }
  setInterval(function() {
    send_line_segments();
    update(room, context, canvas);
  }, 500);
  $('#clear-all').click(function(ev) {
    ev.preventDefault();
    clearCanvas(context, canvas.get(0));
  });
  var on_mousemove = function(ev) {
    var p = canvas_mouse_pos(ev, canvas);
    if ( mouse_down) {
      if (last_x !== -1 && last_y !== -1) {
        context.beginPath();
        context.moveTo(last_x, last_y);
        context.lineTo(p.x, p.y);
        context.strokeStyle = color;
        context.stroke();
        line_buffer = line_buffer.concat(last_x, last_y, p.x, p.y);
        context.closePath();
      }
      last_x = p.x;
      last_y = p.y;
    }
  };
  var on_mouseup = function(ev) {
    mouse_down = false;
    last_x = -1;
    last_y = -1;
  };
  var on_mousedown = function(ev) {
    mouse_down = true;
    var p = canvas_mouse_pos(ev, canvas);
    last_x = p.x;
    last_y = p.y;
  };
  canvas.bind({
    'mousemove': on_mousemove,
    'mousedown': on_mousedown,
    'mouseup': on_mouseup
  });
  $('input[name="share-url"]').click(function(ev){
    ev.preventDefault();
    $('input[name="share-url"]').select();
  });
}

$(function() {
  var room, color, prompt;
  var room_parameter = url_parameter('room');
  if (room_parameter !== 0) {
    room = room_parameter;
    prompt = 'You joined a room: ' + room + '. Enter a nickname:';
    $('input[name="share-url"]').val(window.location.href);
    show_prompt(prompt);
  }
  else {
    $.get('/get-a-room', function(data) {
      room = data;
      $('input[name="share-url"]').val(window.location.href + '?room=' + room);
      show_prompt('You joined a new room: ' + room + '. Enter a nickname:');
    });
  }
  
  function show_prompt(prompt) {
    smoke.prompt(prompt, function(name) {
      if (name) {
        $.get('/join', {
          name: name,
          room: room
          }, function(data) {
            color = data;
            go(name, room, color);
          });
      } else {
        location.reload();
      }
    });
  }
});
