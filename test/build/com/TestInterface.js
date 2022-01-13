var Class = require("./../core/Class.js");
function TestInterface(){}
Class.creator(2,TestInterface,{
	'id':2,
	'ns':'com',
	'name':'TestInterface'
}, false);
module.exports=TestInterface;