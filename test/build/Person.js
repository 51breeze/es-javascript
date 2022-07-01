const Class = require("./core/Class.js");
const TestInterface = require("./com/TestInterface.js");
const _private = Symbol("private");
function Person(name){
	Object.call(this);
	Object.defineProperty(this,_private,{
		value:{
			_name:'',
			_type:null
		}
	});
	this[_private]._name=name;
}
const members = {
	addressName:{
		m:3,
		id:1,
		writable:true,
		enumerable:true,
		value:"the Person properyt \"addressName\""
	},
	_name:{
		m:1,
		id:1,
		writable:true,
		value:''
	},
	_type:{
		m:1,
		id:1,
		writable:true,
		value:null
	},
	target:{
		m:3,
		id:4,
		enumerable:true,
		get:function target(){
			return this;
		}
	},
	setType:{
		m:3,
		id:3,
		value:function setType(a){
			this[_private]._type=a;
			return a;
		}
	},
	method:{
		m:3,
		id:3,
		value:function method(name,age){
			var str = ["a","1"];
			var b = ["",["1",1]];
			var cc = [1];
			var x = [1,1,'2222',{}];
			b.push('1');
			b.push(['1',1]);
			var c = - 1968;
			var bs = 22.366;
			var bssd = - 22.366;
			Person.prototype.address.call(this.target);
			return "sssss";
		}
	},
	name:{
		m:3,
		id:4,
		enumerable:true,
		get:function name(){
			return this[_private]._name;
		},
		set:function name(val){
			this[_private]._name=val;
		}
	},
	avg:{
		m:3,
		id:3,
		value:function avg(a,b){
			return a;
		}
	},
	address:{
		m:1,
		id:3,
		value:function address(){}
	},
	addressNamesss:{
		m:2,
		id:3,
		value:function addressNamesss(){}
	}
}
Class.creator(4,Person,{
	id:1,
	name:"Person",
	dynamic:true,
	private:_private,
	imps:[TestInterface],
	members:members
});
module.exports=Person;