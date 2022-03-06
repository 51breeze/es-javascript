var Class = require("./../core/Class.js");
var _private=Symbol("private");
function Param(){
}
var members = {};
members.start={m:3,d:3,value:function start(){
	var en = (en={},en[en["name1000"]=6]="name1000",en[en["age"]=7]="age",en);
	var b = en.age;
	var result = this.getList(en,[9,5]);
	it("test getList",function(){
		expect(6).toBe(result);
	});
	this.ave(2.3660);
}};
members.getList={m:3,d:3,value:function getList(_s,_s1){
	_s = _s || {};
	_s1 = _s1 || [];
	var _this = this;
	var name1000 = _s.name1000;
	var age = _s.age || 9;
	var index = _s1[0];
	var id = _s1[1] || 20;
	var args = [index,id];
	it("test call",function(){
		var b = _this.call.apply(this,[].concat(args));
		expect(5).toBe(b);
	});
	return name1000;
}};
members.call={m:3,d:3,value:function call(index,id){
	return id;
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