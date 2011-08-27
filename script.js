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
  var pen_down = false;
  canvas[0].addEventListener('mousemove', on_mousemove, false);
  function on_mousemove (ev) {
    var x = ev.pageX - canvas.offset().left;
    var y = ev.pageY - canvas.offset().top;
    if (!pen_down) {
      context.beginPath();
      context.moveTo(x, y);
      pen_down = true;
    } else {
      context.lineTo(x, y);
      context.strokeStyle = color;
      context.stroke();
    }
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
