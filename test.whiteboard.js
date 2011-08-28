//var Whiteboard = require('./whiteboard').Whiteboard;
var Lines = require('./whiteboard').Lines;

//var x = new Whiteboard('mofomofo');
//for (var i = 1; i < 10; i++) {
//  x.add_line(i, i+1, i+2, i+3);
//}
//for (l in x.board) {
//  console.log(x.board[l].pretty());
//}

var lines = new Lines();
console.log('Size: ' + lines.size);
lines.add(1337);
//list.add(4000);
console.log('list[0] = ' + lines.get(0));
//console.log('list[1] = ' + list.get(1));
//setTimeout(function() {
//  console.log(list.get(0));
//}, 5000);

lines.test_db();
