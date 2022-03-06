var Class = require("./../core/Class.js");
var _private=Symbol("private");
function Param(){
}
var members = {};
members.start={m:3,d:3,value:function start(){
	var en = (en={},en[en["name1000"]=6]="name1000",en[en["age"]=7]="age",en);
	var t = (t={},t[t["name"]='A']="name",t[t["A"]='c']="A",t);
	var b = en.age;
	this.getList(en,[9,5]);
	this.ave(2.3660);
}};
members.getList={m:3,d:3,value:function getList(_s,_s1){
	_s = _s || {};
	_s1 = _s1 || [];
	var name1000 = _s.name1000;
	var age = _s.age || 9;
	var index = _s1[0];
	var id = _s1[1] || 20;
	console.log(name1000,age,index,id);
	var args = [index,id];
	console.log.apply(this,[].concat(args));
	return name1000;
}};
members.ave={m:3,d:3,value:function ave(age){
	return age;
}};
Class.creator(6,Param,{
	'id':1,
	'ns':'unit',
	'name':'Param',
	'private':_private,
	'members':members
}, false);
module.exports=Param;