function urldecode(str) {
  return unescape(str.replace(/\+/g, ' '));
}
function clearCanvas(context, canvas) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
}
function getUsers(room) {
  var i;
  $.getJSON('/users', {
    room: room
  }, function(data) {
    $('#users').html(room + ': ');
    for ( i in data ) {
      $('#users').append('<span style="color: ' + data[i].color + ';">' + data[i].name + '</span> ');
    }
  });
}
function update(room, context) {
  var i, j, x, y;
  $.getJSON('/update', {
    room: room
  }, function(data) {
    console.log(data);
    //clearCanvas(context, canvas);
    for ( i in data ) {
      for ( j = 0; j < data[i].length; j += 4) {
        context.beginPath();
        context.lineTo(data[i][j], data[i][j+1]);
        context.lineTo(data[i][j+2], data[i][j+3]);
        context.stroke();
      }
    }
  });
}
function url_parameter(name) {
  // from here: http://snipplr.com/view/26662/get-url-parameters-with-jquery--improved/
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (!results) { return 0; }
  return results[1] || 0;
}

function go(name, room, color) {
  setInterval(function() {
    getUsers(room)
  }, 1337);
  $('#updater').click(function(ev){
    ev.preventDefault();
    update(room, context);
  });
  // periodically send new lines segments to the server
  setInterval(function() {
    send_line_segments();
  }, 1000);
  var canvas = $('#canvas');
  var context = canvas.get(0).getContext('2d');
  var mouse_down = false;
  var last_x = -1, last_y = -1; // start of the current line segment
  var line_buffer = [] // lines waiting to be sent to server
  $('#clear-all').click(function(ev) {
    ev.preventDefault();
    clearCanvas(context, canvas.get(0));
  });
  var on_mousemove = function(ev) {
    var x = ev.pageX - canvas.offset().left;
    var y = ev.pageY - canvas.offset().top;
    if ( mouse_down) {
      if (last_x !== -1 && last_y !== -1) {
        context.lineTo(x, y);
        context.strokeStyle = color;
        context.stroke();
        buffer_line_segment(last_x, last_y, x, y);
      }
      last_x = x;
      last_y = y;
    }
  }
  var on_mouseup = function(ev) {
    mouse_down = false;
    last_x = -1;
    last_y = -1;
  }
  var on_mousedown = function(ev) {
    mouse_down = true;
    context.beginPath();
  }
  canvas.bind({
    'mousemove': on_mousemove,
    'mousedown': on_mousedown,
    'mouseup': on_mouseup
  });
  $('input[name="share-url"]').click(function(ev){
    ev.preventDefault();
    $('input[name="share-url"]').select();
  });
  function buffer_line_segment (x1, y1, x2, y2) {
    // add a line segment to the buffer to be sent to server
    line_buffer = line_buffer.concat(x1, y1, x2, y2);
  }

  function send_line_segments () {
    // send new line segments to the server and empty the buffer
    // do nothing if there are no lines to send
    if (line_buffer.length === 0) {
      return;
    }
    var data = {};
    data.room = room;
    data.lines = line_buffer;
    $.get('/draw', {data: JSON.stringify(data)}, function() {
      // success, clear the line buffer
      // TODO: if lines are drawn during the request, they will be lost here
      line_buffer = [];
    });
  }

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
  
  function show_prompt (prompt) {
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
  };
});
