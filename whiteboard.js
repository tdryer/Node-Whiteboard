String.prototype.format = function() {
  var formatted = this;
  for(arg in arguments) {
    formatted = formatted.replace("{" + arg + "}", arguments[arg]);
  }
  return formatted;
};

function CList(duration) {
  this.duration = duration;
  this.size = 0;
  this.repeat = [];
  this.bitmap = [];
  this.list = [];
  this.add = function(item) {
    this.list.push(item);
    this.bitmap[this.size] = true;
    this.repeat[this.size] = false;
    // this.bitmap.push(true);
    // this.repeat.push(false);
    setTimeout(this.decay, this.duration, [this, this.size]);
    this.size++;
  };
  this.get = function(index) {
    if (this.bitmap[index] == true) {
      // refresh it's duration in the cache
      this.repeat[index] = True
      // element is loaded locally
      return this.list[index];
    }
    else {
      // element must be loaded from db
      console.log('STUB: loading element[' + index + '] from db');
    }
  };
  this.decay = function(args) {
    var obj = args[0];
    var index = args[1];
    if (obj.bitmap[index]) {
      // element is in the cached
      if (!obj.repeat[index]) {
        delete obj.list[index];
        obj.bitmap[index] = false;
      }
      else {
        obj.repeat[index] = false;
        setTimeout(obj.decay, obj.duration, index);
      }
    }
    else {
      // element is not in the cache
      // and therefore we can't do anything about it.
      obj.repeat[index] = false;
    }
  };
  this.del = function(index) {
    // remove element at index from 
  };
}

function Line(x1, y1, x2, y2) {
  this.src = [x1, y1]; // (x, y)
  this.dest = [x2, y2]; // (x, y)
  this.pretty = function() {
    return 'src({0},{1}) ==> dest({2},{3})'.format(this.src[0], this.src[1], this.dest[0], this.dest[1]);
  };
}

module.exports.Whiteboard = function(name) {
  this.name = name; // unique
  this.board = []; // list of line coordinates src(x, y), dest(x, y)
  this.room = []; // list of user references
  this.add_line = function(x1, y1, x2, y2) {
    this.board.push(new Line(x1, y1, x2, y2));
  };
  this.get_lines = function() {
    return this.board;
  };
};

module.exports.CList = CList;
