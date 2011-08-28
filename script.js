function get_random_id() {
  // TODO: maybe something more robust
  return Math.round(Math.random() * 100000).toString();
}
function clearCanvas(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
}
function update_ink(ink_percent) {
  var ink = Math.round(ink_percent*100);
  $('#ink').html('Ink used: ' + ink + '%');
  return ink;
}
function update_users(room, data) {
  var i;
  $('#users').html('<b>' + room + '</b>:<br>');
  for ( i in data ) {
    $('#users').append('<br><span style="color: ' + data[i].color + ';">' + data[i].name + '</span> ');
  }
}
function draw_lines(context, lines, color) {
  var j;
  for ( j = 0; j < lines.length; j += 4) {
      context.beginPath();
      context.lineTo(lines[j], lines[j+1]);
      context.lineTo(lines[j+2], lines[j+3]);
      context.strokeStyle = color;
      context.stroke();
      context.closePath();
    }
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
function update(room, context, canvas, id) {
  $.getJSON('/update', {id: id}, function(data) {
    // data is a list of update objects
    if ( data === 'clear' ) {
      console.log('doing clear');
      context.clearRect(0,0,canvas.width(),canvas.height());
    } else {
      var i;
      for (i in data) {
        if (data[i].type === "lines") {
          draw_lines(context, data[i].lines, data[i].color);
        } else if (data[i].type === "users") {
          update_users(room, data[i].users);
        }
      }
    }
  });
}
function go(name, room, color, id) {
  var canvas = $('#canvas');
  var context = canvas.get(0).getContext('2d');
  canvas.onselectstart = function () { return false; }; // ie
  canvas.onmousedown = function () { return false; }; // mozilla
  var mouse_down = false;
  var last_x = -1, last_y = -1; // start of the current line segment
  var line_buffer = []; // lines waiting to be sent to server
  var ink_level = 0; // between 0-100
  function send_line_segments() {
    // send new line segments to the server and empty the buffer
    // do nothing if there are no lines to send
    if (line_buffer.length === 0) {
      return;
    }
    var sent_length = line_buffer.length; // number of entries we try to send
    $.get('/draw', {id: id, data: JSON.stringify({lines: line_buffer})}, function() {
      // success, clear the line buffer of lines which were sent
      // this prevents lines drawn during the request from being lost
      line_buffer = line_buffer.slice(sent_length, line_buffer.length);
    });
  }
  setInterval(function() {
    send_line_segments();
    update(room, context, canvas, id);
    if (ink_level >= 100) {
      $('canvas').css('cursor', 'not-allowed');
    } else {
      $('canvas').css('cursor', 'crosshair');
    }
  }, 500);
  $('#clear-all').click(function(ev) {
    ev.preventDefault();
    $.get('/clear', {room: room});
  });
  var on_mousemove = function(ev) {
    var p = canvas_mouse_pos(ev, canvas);
    if ( mouse_down) {
      if (last_x !== -1 && last_y !== -1 && ink_level < 100) {
        //TODO: do the drawing with draw_lines function?
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
  $('#export').click(function(ev){
    ev.preventDefault();
    window.open(canvas.get(0).toDataURL());
  });
  window.onbeforeunload = function() {
    $.get('/leave', {
      id: id
    });
  };
}

$(function() {
  $('html').noisy({
    'intensity' : 1,
    'size' : 200,
    'opacity' : 0.1,
    'fallback' : '',
    'monochrome' : false
  });
  var room, color, prompt;
  var room_parameter = url_parameter('room');
  if ( room_parameter ) {
    room = room_parameter;
    prompt = 'Welcome to <img src="/icon.png" /><span class="title">Node Whiteboard</span>, a realtime collaborative drawing tool.<br><br>We\'ve got a room (' +  room + ') ready for you,<br>to get started, simply enter a nickname:';
    $('input[name="share-url"]').val(window.location.href);
    var new_id = get_random_id();
    smoke.prompt(prompt, function(name) {
      if (name) {
        $.get('/join', {
          name: name,
          room: room,
          id: new_id
          }, function(data) {
            color = data;
            $('.container').show();
            go(name, room, color, new_id);
          });
      } else {
        location.reload();
      }
    });
  } else {
    $.get('/get-a-room', function(data) {
      room = data;
      window.location.href = window.location.href + '?room=' + room;
    });
  }
});
