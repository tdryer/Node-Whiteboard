module.exports = {
  plain: {
    'Content-Type': 'text/plain'
  },
  plain_gzip: {
    'Content-Type': 'text/plain',
    'Content-Encoding': 'gzip'
  },
  html: {
    'Content-Type': 'text/html',
    'Content-Encoding': 'gzip'
  },
  css: {
    'Content-Type': 'text/css',
    'Content-Encoding': 'gzip'
  },
  js: {
    'Content-Type': 'text/javascript',
    'Content-Encoding': 'gzip'
  },
  png: {
    'Content-Type': 'image/png',
    'Content-Encoding': 'gzip'
  }
};

function getTintedColor(color, v) {
  color = color.substring(1, color.length);
  var rgb = parseInt(color, 16);
  var r = Math.abs( ( ( rgb >> 16 ) & 0xFF ) + v );
  if ( r > 255 ) {
    r = r - ( r - 255 );
  }
  var g = Math.abs( ( ( rgb >> 8 ) & 0xFF ) + v );
  if ( g > 255 ) {
    g = g - ( g - 255 );
  }
  var b = Math.abs( ( rgb & 0xFF ) + v );
  if ( b > 255 ) {
    b = b - ( b - 255 );
  }
  r = Number( r < 0 || isNaN(r) ) ? 0 : ( (r > 255) ? 255 : r).toString(16);
  if (r.length === 1) {
    r = '0' + r;
  }
  g = Number( g < 0 || isNaN(g) ) ? 0 : ( (g > 255) ? 255 : g).toString(16);
  if (g.length === 1) {
    g = '0' + g;
  }
  b = Number( b < 0 || isNaN(b) ) ? 0 : ( (b > 255) ? 255 : b).toString(16);
  if (b.length === 1) {
    b = '0' + b;
  }
  return "#" + r + g + b;
}

module.exports.genColor = function() {
  var h = (~~(Math.random() * (1 << 24))).toString(16);
  return getTintedColor('#000000'.substr(0, 7 - h.length) + h, 1);
};

module.exports.genRoom = function(length) {
  var text = '', i = 0, len = length ? length : 6;
  var pool = 'Team-Heisenbug-Node-Knockout-David-Michael-Tom-August-2011';
  for ( ; i < len ; i++ ) {
    text += pool.charAt( Math.floor (Math.random() * pool.length ) );
  }
  return text;
};

module.exports.MAX_INK = 2048;
