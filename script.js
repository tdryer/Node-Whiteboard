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
      console.log(context.toDataURL('image/png'));
    }
  }
  
  function on_mouseup (ev) {
    mouse_down = false;
  }
  
  function on_mousedown (ev) {
    mouse_down = true;
    context.beginPath();
  }
  
};
var getUsers = function() {
  $.getJSON('/users', function(data){
    console.log(data)
    $('#users').html('Connected: ' + data);
  });
}
$(function(){
  smoke.prompt('what\'s your name?',function(e){
    if (e){
      procede(e);
    } else {
      window.location.href = window.location.href;
    }
  });
});
