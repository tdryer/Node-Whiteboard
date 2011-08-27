var procede = function(name) {
  var name = name, color;
  $.get(
    '/join', {
      name: name
    }, function(data) {
      color = data;
      console.log(color);
      setInterval(getUsers, 2000);
    }
  );
  $('#clear-all').click(function(ev){
    ev.preventDefault();
    console.log('clear-all clicked');
  });
  
  var whiteboard_id = 'WHITEBOARD_ID_HERE'; //TODO
  
  var canvas = $('canvas#canvas');
  var context = canvas[0].getContext('2d');
  var mouse_down = false;
  canvas.bind({'mousemove': on_mousemove, 
               'mousedown': on_mousedown, 
               'mouseup': on_mouseup});

  function on_mousemove (ev) {
    var x = ev.pageX - canvas.offset().left;
    var y = ev.pageY - canvas.offset().top;
    if (mouse_down) {
      context.lineTo(x, y);
      context.strokeStyle = color;
      context.stroke();
      send_line_segment(x, y, x, y);
    }
  }
  
  function on_mouseup (ev) {
    mouse_down = false;
  }
  
  function on_mousedown (ev) {
    mouse_down = true;
    context.beginPath();
  }
  
  function send_line_segment (startX, startY, endX, endY) {
    var data = {
      whiteboard: whiteboard_id,
      x1: startX,
      y1: startY,
      x2: endX,
      y2: endY
    };
    $.post('/draw2', data);
  }
  
};
var getUsers = function() {
  $.getJSON('/users', function(data){
    console.log(data)
    $('#users').html('Connected: ' + data);
  });
}
$(function(){
  smoke.prompt('what\'s your name?',function(name, room){
    if (name){
      procede(name);
    } else {
      window.location.href = window.location.href;
    }
  });
});
