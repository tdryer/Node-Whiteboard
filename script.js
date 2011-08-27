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
    $.post('/draw', {
      data: canvas.get(0).toDataURL()
    });
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