import Class from "./../core/Class.js";
function TestInterface(){}
Class.creator(7,TestInterface,{
	id:1,
	ns:"com",
	name:"TestInterface",
	dynamic:true
});
module.exports=TestInterface;