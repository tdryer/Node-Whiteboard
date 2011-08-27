module.exports.Whiteboard = function(name) {
  this.name = name;
  this.board = [];
  this.load = function() {
    console.log('STUB: load whiteboard=' + this.name + ' from database');
  }
}
