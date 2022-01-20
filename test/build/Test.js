var Person = require("./Person.js");
var TestInterface = require("./com/TestInterface.js");
var EventDispatcher = require("./core/EventDispatcher.js");
var Event = require("./core/Event.js");
var Types = require("./Types.js");
var Class = require("./core/Class.js");
var Reflect = require("./core/Reflect.js");
var System = require("./core/System.js");
var _private=Symbol("private");
function Test(name,age){
	Object.defineProperty(this,_private,{value:{'bbss':'bbss','age':40,'len':5,'currentIndex':0}});
	Person.call(this,name);
	Person.prototype.setType.call(this,'1');
	this.target;
}
var methods = {};
methods.getClass={m:3,d:3,value:function getClass(){
	var a = Test;
	var buname = {"a":1};
	buname.test=a;
	buname.person=Person;
	var test=buname.test;
	expect(Test).toBe(test);
	expect(Test).toBe(Reflect.call(Test,test,"getClassObject"));
	expect(Test).toBe(Reflect.call(Test,test,'getClassObject'));
	return buname;
}};
methods.getClassObject={m:3,d:3,value:function getClassObject(){
	var a = Test;
	var b = {"test":a};
	b.person=Person;
	return b.test;
}};
methods.getObject={m:3,d:3,value:function getObject(){
	return new Test('1','2');
}};
methods.uuName={m:3,d:4,enumerable:true,get:function uuName(){
	return 'uuName';
}};
methods.iiu={m:1,d:1,writable:true,value:Test};
methods.main={m:3,d:3,value:function main(){
	(new Test('Test')).start();
}};
var members = {};
members.bbss={m:1,d:1,writable:true,value:'bbss'};
members.age={m:1,d:2,value:40};
members.start={m:3,d:3,value:function start(){
	var _this = this;
	it("static get uuName accessor",function(){
		expect(Test.getClassObject().uuName).toBe("uuName");
	});
	it("'this.age' should is true",function(){
		expect(_this[_private].age).toBe(40);
	});
	it("'System.className' should is true",function(){
		expect('Test').toBe(System.getQualifiedClassName(Test));
	});
	it("'this instanceof Person' should is true",function(){
		expect(_this instanceof Person).toBeTrue();
	});
	it("\"this is Person\" should is true",function(){
		expect(System.is(_this,Person)).toBeTrue();
	});
	it("'this instanceof TestInterface' should is false",function(){
		expect(_this instanceof TestInterface).toBeFalse();
	});
	it("'this is TestInterface' should is true",function(){
		expect(System.is(_this,TestInterface)).toBeFalse();
	});
	it("'Test.getClass().test' should is Test",function(){
		expect(Test.getClass().test).toBe(Test);
	});
	it("'Test.getClass().person' should is Person",function(){
		expect(Test.getClass().person).toBe(Person);
	});
	it("'new (Test.getClass().person)('')' should is true",function(){
		const o = new (Test.getClass().person)('name');
		expect(o instanceof Person).toBeTrue();
	});
	it("'this.bbss=\"666666\"' should is '666666' ",function(){
		expect(_this[_private].bbss).toBe('bbss');
		_this[_private].bbss="666666";
		expect(_this[_private].bbss).toBe('666666');
	});
	it("test name accessor ",function(){
		expect(_this.name).toBe('Test');
		_this.name="test name";
		expect(_this.name).toBe('test name');
	});
	it("'var bsp = ()=>{}' should is '()=>this' ",function(){
		var bsp = function(){
			return _this;
		};
		expect(bsp()).toBe(_this);
	});
	it("once.two.three should is this or object ",function(){
		var bsp = function(flag){
			return _this;
		};
		var obj = {};
		bsp=function(flag){
			if(flag){
				return obj;
			}else{
				return _this;
			}
		};
		var obds = 1;
		const three = bsp(false);
		var once = {"two":{"three":three,"four":bsp}};
		expect(once.two.three).toBe(_this);
		expect(once.two.four(true)).toBe(obj);
		once[obds];
	});
	it("/d+/.test( \"123\" ) should is true ",function(){
		expect(/\d+/.test("123")).toBe(true);
		expect(/^\d+/.test(" 123")).toBe(false);
	});
	it("test rest params",function(){
		const res = _this.restFun(1,"s","test");
		expect(res).toEqual([1,"s","test"]);
	});
	it("test Event Dispatcher",function(){
		const d = new EventDispatcher();
		d.addEventListener('eee',function(e){
			e.data={"name":'event'};
		});
		const event = new Event('eee');
		d.dispatchEvent(event);
		expect({"name":'event'}).toEqual(event.data);
	});
	it("test System.getQualifiedObjectName",function(){
		expect('Test').toEqual(System.getQualifiedObjectName(_this));
		expect('String').toEqual(System.getQualifiedObjectName(new String('')));
		expect('Test').toEqual(System.getQualifiedClassName(Test));
		expect('[Class Test]').toEqual(Test + '');
	});
	this.testEnumerableProperty();
	this.testComputeProperty();
	this.testLabel();
	this.testEnum();
	this.testIterator();
	this.testGenerics();
	this.testAwait();
	this.testTuple();
	this.next();
}};
members.testEnumerableProperty={m:1,d:3,value:function testEnumerableProperty(){
	var _this = this;
	it("for( var name in this) should is this or object ",function(){
		var labels = ["name","data","target","addressName","iuuu",'dynamic','dynamicName'];
		for(var key in _this){
			expect(key).toBe(labels[labels.indexOf(key)]);
			expect(_this[key]).toBe(_this[key]);
		}
	});
}};
members.testComputeProperty={m:1,d:3,value:function testComputeProperty(){
	var _this = this;
	var bname = "123";
	var _c1,_c,o = (_c={},
		_c[bname]=1,
		_c['sssss']=2,
		_c.uuu=(_c1={},
			_c1[bname]=3,
			_c1),
		_c);
	this['dynamicName']='name';
	it("compute property should is true ",function(){
		expect(o[bname]).toBe(1);
		expect(_this['dynamicName']).toBe('name');
		expect(o.uuu[bname]).toBe(3);
		expect(o.uuu["123"]).toBe(3);
		o["uuu"][bname]=true;
		expect(o["uuu"][bname]).toBe(true);
	});
}};
members.testLabel={m:1,d:3,value:function testLabel(){
	var num = 0;
	start:for(var i = 0;i < 5;i++){
		for(var j = 0;j < 5;j++){
			if(i == 3 && j == 3){
				break start;
			}
			num++;
		}
	}
	it("label for should is loop 18",function(){
		expect(num).toBe(18);
	});
}};
members.testEnum={m:1,d:3,value:function testEnum(){
	var Type = (Type={},Type[Type["address"]=5]="address",Type[Type["name"]=6]="name",Type);
	const s = Types;
	const t = Type.address;
	const b = Types.ADDRESS;
	it("Type local enum should is true",function(){
		expect(t).toBe(5);
		expect(Type.name).toBe(6);
	});
	it("Type local enum should is true",function(){
		expect(b).toBe(0);
		expect(Types.NAME).toBe(1);
	});
}};
members.testIterator={m:1,d:3,value:function testIterator(){
	var array = [];
	for(var val,_v,_i=System.getIterator(this); _i && (_v=_i.next()) && !_v.done;){
		val=_v.value;
		Reflect.call(Test,array,"push",[val]);
	}
	it("impls iterator should is [0,1,2,3,4]",function(){
		expect(5).toBe(array.length);
		for(var i = 0;i < 5;i++){
			expect(i).toBe(array[i]);
		}
	});
}};
members.testGenerics={m:1,d:3,value:function testGenerics(){
	var _this = this;
	const ddee = this.map();
	const dd = ddee;
	var ccc = ddee.name({"name":1,"age":1},"123");
	var cccww = dd.name({"name":1,"age":30},666);
	var types = '333';
	var _c2,bds = (_c2={},
		_c2.name=123,
		_c2[types]=1,
		_c2);
	bds[types]=99;
	it("Generics should is true",function(){
		expect(typeof _this.avg("test")).toBe('string');
		expect(ccc.name.toFixed(2)).toBe("1.00");
		expect(cccww.age).toBe(30);
	});
	it("class Generics",function(){
		let obj = _this.getTestObject(true);
		var bd = obj;
		var bs = Reflect.call(Test,obj,"getNamess",[1]);
		expect(Reflect.call(Test,bs,"toFixed",[2])).toBe("1.00");
	});
	var bsint = this.getTestGenerics('sssss');
	var bsstring = this.getTestGenerics("ssss",'age');
	var bd = bsstring;
	let obj = this.getTestObject(true);
	var bsddd = Reflect.call(Test,obj,"getNamess",[1]);
	var sss = Reflect.call(Test,obj,"getClassTestGenerics",[1,1]);
	var type = this;
	type instanceof Number;
	System.is(type,Number);
	type;
	var bb = {"a":'',"b":1};
	var bc = 'label';
	var bj = 3;
	var bt = {"a":'sss',"b":99};
	var be = 'a';
	var bf = 'b';
	var bg = [];
	bg.push('b');
	var v12 = {};
	var v13 = v12[1];
	var v14 = [1];
	var v15 = v14[0];
	it('keyof',function(){
		_this['dynamic']='[1]';
		var v16 = _this['dynamic'];
		expect('[1]').toEqual(v16);
		var bh = _this.testKeyof(bt,'a');
		var fs = _this.testKeyof(bt,'b');
		expect('sss').toEqual(bh);
		expect(99).toEqual(fs);
		var bfd = {"name":'6699'};
		var fdb = _this.testKeyof(bfd,'name');
		expect('6699').toEqual(fdb);
		var getNamessFun = _this.testKeyof(_this,'getNamess');
		expect(_this.getNamess).toEqual(getNamessFun);
		var bdfs4 = getNamessFun('sssss');
	});
	var b9 = function(name,callback){
		var b = callback;
		var n = b(1);
		var v = callback(1);
		return '';
	};
	it('keyof',function(){
		function tNames(){
			return 1;
		}
		var b10 = tNames;
		var b11 = b10();
		expect(1).toEqual(1);
		var bst9 = new Test('111','11111');
		expect('111').toEqual(bst9.getNamess('111'));
	});
}};
members.testKeyof={m:1,d:3,value:function testKeyof(t,k){
	return Reflect.get(Test,t,k);
}};
members.getClassTestGenerics={m:1,d:3,value:function getClassTestGenerics(name,age){
	var a = [age,name];
	return a;
}};
members.getTestGenerics={m:1,d:3,value:function getTestGenerics(name,age){
	var t = new Test('name',name);
	return age;
}};
members.getTestObject={m:1,d:3,value:function getTestObject(flag){
	const factor = function(){
		const o = {};
		o.test=new Test('name',1);
		o.name="test";
		return o.test;
	};
	var o = factor();
	return o;
}};
members.getNamess={m:3,d:3,value:function getNamess(s){
	return s;
}};
members.testAwait={m:1,d:3,value:function testAwait(){
	var _this = this;
	it("test Await",function(done){
		const res = _this.loadRemoteData(1);
		res.then(function(data){
			expect(Reflect.get(Test,data,0)).toEqual(['one',1]);
			expect(Reflect.get(Test,data,1)).toEqual({"bss":['two',2],"cc":['three',3]});
			expect(Reflect.get(Test,data,2)).toEqual(['three',3]);
			done();
		});
	});
	it("test for Await",function(done){
		const res = _this.loadRemoteData(2);
		res.then(function(data){
			expect(Reflect.get(Test,data,0)).toEqual(['0',0]);
			expect(Reflect.get(Test,data,1)).toEqual(['1',1]);
			expect(Reflect.get(Test,data,2)).toEqual(['2',2]);
			expect(Reflect.get(Test,data,3)).toEqual(['3',3]);
			expect(Reflect.get(Test,data,4)).toEqual(['4',4]);
			done();
		});
	});
	it("test switch Await",function(done){
		const res = _this.loadRemoteData(3);
		res.then(function(data){
			expect(data).toEqual(['four',4]);
			done();
		});
	});
	it("test switch and for Await",function(done){
		const res = _this.loadRemoteData(4);
		res.then(function(data){
			expect(data).toEqual([['five',5],['0',0],['1',1],['2',2],['3',3],['4',4]]);
			done();
		});
	});
	Reflect.get(Test,this.getJson(),'name');
}};
members.getJson={m:3,d:3,value:function getJson(){
	return {"name":123};
}};
members.testTuple={m:3,d:3,value:function testTuple(){
	const data = this.method("end",9);
	it("test tuple",function(){
		expect(data).toEqual([['a','b'],[1],[1,1,'one'],['one',['one',1],'three','four',['end',9]]]);
	});
}};
members.len={m:1,d:2,value:5};
members.currentIndex={m:1,d:1,writable:true,value:0};
members.next={m:3,d:3,value:function next(){
	if(! (this[_private].currentIndex < this[_private].len)){
		return {"value":null,"done":true};
	}
	const d = {"value":this[_private].currentIndex++,"done":false};
	return d;
}};
members.rewind={m:3,d:3,value:function rewind(){
	this[_private].currentIndex=0;
}};
members.restFun={m:3,d:3,value:function restFun(){
	var types = Array.prototype.slice.call(arguments,0);
	return types;
}};
members.tetObject={m:3,d:3,value:function tetObject(){
	var t = new Test('1',1);
	var b = t;
	var ii = {"bb":b};
	return ii.bb;
}};
members.loadData={m:3,d:3,value:function loadData(){

}};
members.iuuu={m:3,d:4,enumerable:true,get:function iuuu(){
	var ii = this.name;
	if(6){
		ii=[];
	}
	ii=true;
	return ii;
}};
members.data={m:3,d:4,enumerable:true,get:function data(){
	var b = [];
	if(4){
		b=this.avg;
	}
	b=this.avg;
	const dd = function(){
		var bs = new Promise(function(resolve,reject){
			setTimeout(function(){
				resolve([]);
			},100);
		});
		return bs;
	};
	return b;
}};
members.fetchApi={m:3,d:3,value:function fetchApi(name,data,delay){
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve([name,data]);
		},delay);
	});
}};
members.loadRemoteData2={m:3,d:3,value:function loadRemoteData2(){

	return System.awaiter(this, void 0, void 0, function (){

		return System.generator(this, function (_a) {
			switch (_a.label){
				case 0 :
					return [4,this.fetchApi("one",1,800)];
				case 1:
					return [2, _a.sent()];

			}
		});
	});
}};
members.loadRemoteData={m:3,d:3,value:function loadRemoteData(type){

	return System.awaiter(this, void 0, void 0, function (){
		var a;
		var bs;
		var c;
		var list;
		var b;
		var bb;
				var i;
		return System.generator(this, function (_a) {
			switch (_a.label){
				case 0 :
					if(!(type === 1))return [3,4];
					return [4,this.fetchApi("one",1,800)];
				case 1:
					a = _a.sent();
					return [4,this.fetchApi("two",2,500)];
				case 2:
					bs = {"bss":_a.sent()};
					return [4,this.fetchApi("three",3,900)];
				case 3:
					c = _a.sent();
					bs.cc=c;
					return [2, [a,bs,c]];
				case 4:
					list = [];
					switch(type){
						case 3 : return [3,5];
						case 4 : return [3,7];
					}
					return [3,9];
				case 5:
					return [4,this.fetchApi("four",4,300)];
				case 6:
					b = _a.sent();
					return [2, b];
				case 7:
					return [4,this.fetchApi("five",5,1200)];
				case 8:
					bb = _a.sent();
					Reflect.call(Test,list,"push",[bb]);
					return [3,9];
				case 9:
					i=0;
					_a.label=10;
				case 10:
					if( !(i < 5) )return [3, 13];
					return [4,this.fetchApi(i + '',i,100)];
				case 11:
					Reflect.call(Test,list,"push",[_a.sent()]);
					_a.label=12;
				case 12:
					i++;
					return [3, 10];
				case 13:
					Reflect.call(Test,list,"entries");
					return [2, list];

			}
		});
	});
}};
members.method={m:3,d:3,value:function method(name,age){
	Person.prototype.method.call(this,name,age);
	var str = ["a","b"];
	var b = ["one",["one",1]];
	var cc = [1];
	var x = [1,1,'one'];
	b.push('three');
	b.push('four');
	b.push([name,age]);
	return [str,cc,x,b];
}};
members.name={m:3,d:4,enumerable:true,get:function name(){
	return Person[Class.key].members.name.get.call(this);
},set:function name(value){
	Person[Class.key].members.name.set.call(this,value);
}};
members.avg={m:3,d:3,value:function avg(yy,bbc){
	var ii = function(){
	return 1;
	};
	var bb = ['1'];
	function name(i){
		var b = i;
		i.avg('');
		i.method('',1);
		return b;
	}
	const person = new Person('');
	name(person);
	const bbb = name(person);
	name(person);
	var dd = [1,1,"2222","66666","8888"];
	var a1=dd[0],a2=dd[1],a3=dd[2];
	expect(1).toEqual(a1);
	expect(1).toEqual(a2);
	expect("2222").toEqual(a3);
	expect([1,1,"2222","66666","8888"]).toEqual(dd);
	expect(['1']).toEqual(bb);
	bb.push();
	expect(['1']).toEqual(bb);
	dd.push(1);
	expect([1,1,"2222","66666","8888",1]).toEqual(dd);
	return yy;
}};
members.map={m:3,d:3,value:function map(){
	const ddss = {"name":function(c,b){
		var id = b;
		return c;
	}};
	return ddss;
}};
members.address={m:1,d:3,value:function address(){
	const dd = [];
	const bb = {"global":1,"private":1};
	dd.push(1);
	return dd;
}};
members[Symbol.iterator]={value:function(){return this;}}
Class.creator(0,Test,{
	'id':1,
	'ns':'',
	'name':'Test',
	'dynamic':true,
	'private':_private,
	'imps':[TestInterface],
	'inherit':Person,
	'methods':methods,
	'members':members
}, false);
module.exports=Test;
Test.main();