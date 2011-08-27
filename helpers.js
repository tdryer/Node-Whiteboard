module.exports = {
  plain: {
    'Content-Type': 'text/plain'
  },
  html: {
    'Content-Type': 'text/html'
  }
};

module.exports.genColor = function() {
  return '#' + Math.floor( Math.random() * 16777215 ).toString(16);
};

module.exports.genRoom = function(length) {
  var text = '', i = 0, len = length ? length : 6;
  var pool = 'Team-Heisenbug-Node-Knockout-David-Michael-Tom-August-2011';
  for ( ; i < len ; i++ ) {
    text += pool.charAt( Math.floor (Math.random() * pool.length ) );
  }
  return text;
};