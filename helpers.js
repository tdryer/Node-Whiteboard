var querystring = require('querystring');

module.exports = {
  plain: {
    'Content-Type': 'text/plain'
  },
  plaingzip: {
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

module.exports.genColor = function() {
  var h = (~~(Math.random() * (1 << 24))).toString(16);
  return '#000000'.substr(0, 7 - h.length) + h;
};

module.exports.genRoom = function(length) {
  var text = '', i = 0, len = length ? length : 6;
  var pool = 'Team-Heisenbug-Node-Knockout-David-Michael-Tom-August-2011';
  for ( ; i < len ; i++ ) {
    text += pool.charAt( Math.floor (Math.random() * pool.length ) );
  }
  return text;
};

module.exports.post_handler = function(request, callback) {
  var _REQUEST = {};
  var _CONTENT = '';

  if (request.method == 'POST') {
    request.addListener('data', function(chunk) {
      _CONTENT+= chunk;
    });

    request.addListener('end', function() {
      _REQUEST = querystring.parse(_CONTENT);
      callback(_REQUEST);
    });
  };
};

module.exports.MAX_INK = 1024;
