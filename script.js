function getUsers(room) {
  var i;
  $.getJSON('/users', {
    room: room
  }, function(data) {
    $('#users').html(room + ': ');
    for ( i in data ) {
      $('#users').append('<span style="color: ' + data[i].color + ';">' + data[i].name + '</span> ');
    }
    return true;
  });
}
function go(name, room, color) {
  setInterval(getUsers(room), 1337);
}
$(function() {
  var canvas = $('#canvas');
  var context = canvas.get(0).getContext('2d');
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