//var Whiteboard = require('./whiteboard').Whiteboard;
var CList = require('./whiteboard').CList;

//var x = new Whiteboard('mofomofo');
//for (var i = 1; i < 10; i++) {
//  x.add_line(i, i+1, i+2, i+3);
//}
//for (l in x.board) {
//  console.log(x.board[l].pretty());
//}

var list = new CList(1000);
console.log('Size: ' + list.size);
list.add(1337);
//list.add(4000);
console.log('list[0] = ' + list.get(0));
//console.log('list[1] = ' + list.get(1));
setTimeout(function() {
  console.log(list.get(0));

}, 5000);
