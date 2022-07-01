const Class = require("./../core/Class.js");
function TestInterface(){}
Class.creator(5,TestInterface,{
	id:1,
	ns:"com",
	name:"TestInterface",
	dynamic:true
});
module.exports=TestInterface;