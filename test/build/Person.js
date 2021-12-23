var TestInterface = require("./com/TestInterface.js");
var Class = require("./core/Class.js");
var _private=Symbol("private");
function Person(name){
	Object.defineProperty(this,_private,{value:{'_name':'','_type':null}});
	Object.call(this);
	this[_private]._name=name;
}
var members = {};
members.addressName={m:3,d:1,writable:true,enumerable:true,value:"the Person properyt \"addressName\""};
members._name={m:1,d:1,writable:true,value:''};
members._type={m:1,d:1,writable:true,value:null};
members.target={m:3,d:4,enumerable:true,get:function target(){
	return this;
}};
members.setType={m:3,d:3,value:function setType(a){
	this[_private]._type=a;
	return a;
}};
members.method={m:3,d:3,value:function method(name,age){
	var str = ["a","1"];
	var b = ["",["1",1]];
	var cc = [1];
	var x = [1,1,'2222',{}];
	b.push('1');
	b.push(['1',1]);
	var c = -1968;
	var bs = 22.366;
	var bss = 22.366;
	var bssd = -22.366;
	Person.prototype.address.call(this.target);
	return "sssss";
}};
members.name={m:3,d:4,enumerable:true,get:function name(){
	return this[_private]._name;
},set:function name(val){
	this[_private]._name=val;
}};
members.avg={m:3,d:3,value:function avg(a,b){
	return a;
}};
members.address={m:1,d:3,value:function address(){

}};
members.addressNamesss={m:2,d:3,value:function addressNamesss(){

}};
Class.creator(1,Person,{
	'id':1,
	'ns':'',
	'name':'Person',
	'private':_private,
	'imps':[TestInterface],
	'members':members
});
module.exports=Person;