window.addEventListener('load', function () {
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var pen_down = false;
  canvas.addEventListener('mousemove', on_mousemove, false);
  
  function on_mousemove (ev) {
    if (!pen_down) {
      context.beginPath();
      context.moveTo(ev.offsetX, ev.offsetY);
      pen_down = true;
    } else {
      context.lineTo(ev.offsetX, ev.offsetY);
      context.stroke();
    }
  }
  
});

