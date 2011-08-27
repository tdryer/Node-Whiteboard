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
  $.get('/update', {
    room: room
  }, function(data) {
    var imageObj = new Image();
    imageObj.onload = function() {
      context.drawImage(this, 0, 0);
    };
    imageObj.src = urldecode(data);
  });
}
function go(name, room, color) {
  setInterval(function() {
    getUsers(room)
  }, 1337);
  var canvas = $('#canvas');
  var context = canvas.get(0).getContext('2d');
  var mouse_down = false;
  $('#clear-all').click(function(ev) {
    ev.preventDefault();
    clearCanvas(context, canvas.get(0));
  });
  var on_mousemove = function(ev) {
    var x = ev.pageX - canvas.offset().left;
    var y = ev.pageY - canvas.offset().top;
    if ( mouse_down ) {
      context.lineTo(x, y);
      context.strokeStyle = color;
      context.stroke();
    }
  }
  var on_mouseup = function(ev) {
    mouse_down = false;
    $.get('/draw', {
      data: canvas.get(0).toDataURL('image/png'),
      room: room
    });
    update(room, context);
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
}
$(function() {
  var room, color;
  $.get('/room', function(data) {
    room = data;
    smoke.prompt('We gave you a room: ' + room + '. What\'s your name?', function(name) {
      if (name) {
        $.get('/join', {
            name: name,
            room: room
          }, function(data) {
            color = data;
            go(name, room, color);
          }
        );
      } else {
        location.reload();
      }
    });
  });
});