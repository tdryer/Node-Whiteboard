String.prototype.format = function() {
  var formatted = this;
  for(arg in arguments) {
    formatted = formatted.replace("{" + arg + "}", arguments[arg]);
  }
  return formatted;
};

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
  this.load = function() { // load from database/cache
    console.log('STUB: load whiteboard=' + this.name + ' from database');
  };
  this.add_line = function(x1, y1, x2, y2) {
    this.board.push(new Line(x1, y1, x2, y2));
  };
  this.print_board = function() {
    for (line in this.board) {
      console.log(line.pretty());
    }
  };
}
