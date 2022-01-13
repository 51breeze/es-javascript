var Class = require("./core/Class.js");
function Types(){}
const methods = {};
methods.ADDRESS={m:3,d:6,value:0};
methods[0]={m:3,d:5,value:"ADDRESS"};
methods.NAME={m:3,d:6,value:1};
methods[1]={m:3,d:5,value:"NAME"};
Class.creator(5,Types,{
	'id':3,
	'ns':'',
	'name':'Types',
	'methods':methods
}, false);
module.exports=Types;