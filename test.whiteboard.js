//var Whiteboard = require('./whiteboard').Whiteboard;
var CList = require('./whiteboard').CList;

//var x = new Whiteboard('mofomofo');
//for (var i = 1; i < 10; i++) {
//  x.add_line(i, i+1, i+2, i+3);
//}
//for (l in x.board) {
//  console.log(x.board[l].pretty());
//}

var list = new CList(5000);
console.log('Size: ' + list.size);
list.add(1337);
var x = list.get(0);
//console.log('list[0] = ' + x);
