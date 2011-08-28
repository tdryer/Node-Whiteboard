var Whiteboard = require('./whiteboard').Whiteboard;

var x = new Whiteboard('mofomofo');

x.load();
x.add_line(1, 2, 3, 4);
console.log(x);
x.print_board();
