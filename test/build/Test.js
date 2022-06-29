function Test(name,age){
	Person.call.this(name);
	Person.prototype.setType.call.this('1');
	this.target;
	Http();
	const map = Map();
	map.set('name',[]);
	map.forEach((item)=>{});
}
const methods = {
	getClass:{
		m:"3",
		id:"3",
		value:function getClass(){
			var a = Test;
			var buname = {
				a:1
			}
			buname.test=a;
			buname.person=Person;
			var test = buname;
			expect(Test).toBe(test);
			expect(Test).toBe(test.getClassObject());
			expect(Test).toBe(Reflect.call(Test,test,'getClassObject'));
			return buname;
		}
	},
	getClassObject:{
		m:"3",
		id:"3",
		value:function getClassObject(){
			var a = Test;
			var b = {
				test:a
			}
			b.person=Person;
			return b.test;
		}
	},
	getObject:{
		m:"3",
		id:"3",
		value:function getObject(){
			return Test('1','2');
		}
	},
	uuName:{
		m:"3",
		id:"4",
		enumerable:"true",
		get:function uuName(){
			return 'uuName';
		}
	},
	iiu:{
		m:"1",
		id:"1",
		writable:"true",
		value:Test
	},
	main:{
		m:"3",
		id:"3",
		value:function main(){
			(Test('Test')).start();
		}
	}
}
const members = {
	bbss:{
		m:"1",
		id:"1",
		writable:"true",
		value:'bbss'
	},
	age:{
		m:"1",
		id:"2",
		value:40
	},
	start:{
		m:"3",
		id:"3",
		value:function start(){
			it("static get uuName accessor",()=>{
				expect(Test.getClassObject().uuName).toBe("uuName");
			});
			it("'this.age' should is true",()=>{
				expect(this[_private].age).toBe(40);
			});
			it("'System.className' should is true",()=>{
				expect('Test').toBe(System.getQualifiedClassName(Test));
			});
			it("'this instanceof Person' should is true",()=>{
				expect(this instanceof Person).toBeTrue();
			});
			it("\"this is Person\" should is true",()=>{
				expect(System.is(this,Person)).toBeTrue();
			});
			it("'this instanceof TestInterface' should is false",()=>{
				expect(this instanceof TestInterface).toBeFalse();
			});
			it("'this is TestInterface' should is true",()=>{
				expect(System.is(this,TestInterface)).toBeFalse();
			});
			it("'Test.getClass().test' should is Test",()=>{
				expect(Test.getClass().test).toBe(Test);
			});
			it("'Test.getClass().person' should is Person",()=>{
				expect(Test.getClass().person).toBe(Person);
			});
			it("'new (Test.getClass().person)('')' should is true",()=>{
				const o = (Test.getClass().person)('name');
				expect(o instanceof Person).toBeTrue();
			});
			it("'this.bbss=\"666666\"' should is '666666' ",()=>{
				expect(this[_private].bbss).toBe('bbss');
				this[_private].bbss="666666";
				expect(this[_private].bbss).toBe('666666');
			});
			it("test name accessor ",()=>{
				expect(this.name).toBe('Test');
				this.name="test name";
				expect(this.name).toBe('test name');
			});
			it("'var bsp = ()=>{}' should is '()=>this' ",()=>{
				var bsp = ()=>{
					return this;
				}
				expect(bsp()).toBe(this);
			});
			it("once.two.three should is this or object ",()=>{
				var bsp = (flag)=>{
					return this;
				}
				var obj = {}
				bsp=(flag)=>{
					if(flag){
						return obj;
					}else{
						return this;
					}
				}
				var obds = 1;
				const three = bsp(false);
				var once = {
					two:{
						three:three,
						four:bsp
					}
				}
				expect(once.two.three).toBe(this);
				expect(once.two.four(true)).toBe(obj);
				once[obds];
			});
			it("/d+/.test( \"123\" ) should is true ",()=>{
				expect(/\d+/.test("123")).toBe(true);
				expect(/^\d+/.test(" 123")).toBe(false);
			});
			it("test rest params",()=>{
				const res = this.restFun(1,"s","test");
				expect(res).toEqual([1,"s","test"]);
			});
			it("test Event Dispatcher",()=>{
				const d = EventDispatcher();
				d.addEventListener('eee',(e)=>{
					e.data={
						name:'event'
					}
				});
				const event = Event('eee');
				d.dispatchEvent(event);
				expect({
					name:'event'
				}).toEqual(event.data);
			});
			it("test System.getQualifiedObjectName",()=>{
				expect('Test').toEqual(System.getQualifiedObjectName(this));
				expect('String').toEqual(System.getQualifiedObjectName(String('')));
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
			var param = Param();
			param.start();
		}
	},
	testEnumerableProperty:{
		m:"1",
		id:"3",
		value:function testEnumerableProperty(){
			it("for( var name in this) should is this or object ",()=>{
				var labels = ["name","data","target","addressName","iuuu",'dynamic','dynamicName'];
				for(var key in this){
					expect(key).toBe(labels[labels.indexOf(key)]);
					expect(this[key]).toBe(this[key]);
				}
			});
		}
	},
	testComputeProperty:{
		m:"1",
		id:"3",
		value:function testComputeProperty(){
			var bname = "123";
			var o = {
				[bname]:1,
				"sssss":2,
				uuu:{
					[bname]:3
				}
			}
			this['dynamicName']='name';
			it("compute property should is true ",()=>{
				expect(o[bname]).toBe(1);
				expect(this['dynamicName']).toBe('name');
				expect(o.uuu[bname]).toBe(3);
				expect(o.uuu["123"]).toBe(3);
				o["uuu"][bname]=true;
				expect(o["uuu"][bname]).toBe(true);
			});
		}
	},
	testLabel:{
		m:"1",
		id:"3",
		value:function testLabel(){
			var num = 0;
			start:
			for(var i = 0;i < 5;i++){
				for(var j = 0;j < 5;j++){
					if(i == 3 && j == 3){
						break 
					}
					num++;
				}
			}
			it("label for should is loop 18",()=>{
				expect(num).toBe(18);
			});
		}
	},
	testEnum:{
		m:"1",
		id:"3",
		value:function testEnum(){
			const Type = (Type={},Type[Type["address"]=5]="address",Type[Type["name"]=6]="name");
			const s = Types;
			const t = Type.address;
			const b = Types.ADDRESS;
			it("Type local enum should is true",()=>{
				expect(t).toBe(5);
				expect(Type.name).toBe(6);
			});
			it("Type local enum should is true",()=>{
				expect(b).toBe(0);
				expect(Types.NAME).toBe(1);
			});
		}
	},
	testIterator:{
		m:"1",
		id:"3",
		value:function testIterator(){
			var array = [];
			for(var val,_v,_i=System.getIterator(this);
			_i && (_v=_i.next()) && !_v.done;){
				array.push(val);
			}
			it("impls iterator should is [0,1,2,3,4]",()=>{
				expect(5).toBe(array.length);
				for(var i = 0;i < 5;i++){
					expect(i).toBe(array[i]);
				}
			});
		}
	},
	testGenerics:{
		m:"1",
		id:"3",
		value:function testGenerics(){
			const ddee = this.map();
			const dd = ddee;
			var ccc = ddee.name({
				name:1,
				age:1
			},"123");
			var cccww = dd.name({
				name:1,
				age:30
			},666);
			var types = '333';
			var bds = {
				name:123,
				[types]:1
			}
			bds[types]=99;
			it("Generics should is true",()=>{
				expect(typeof this.avg("test")).toBe('string');
				expect(ccc.name.toFixed(2)).toBe("1.00");
				expect(cccww.age).toBe(30);
			});
			it("class Generics",()=>{
				let obj = this.getTestObject(true);
				var bd = obj;
				var bs = obj.getNamess(1);
				expect(Reflect.call(Test,bs,"toFixed",[2])).toBe("1.00");
			});
			var bsint = this.getTestGenerics('sssss');
			var bsstring = this.getTestGenerics("ssss",'age');
			var bd = bsstring;
			let obj = this.getTestObject(true);
			var bsddd = obj.getNamess(1);
			var sss = obj.getClassTestGenerics(1,1);
			var type = this;
			type instanceof Number;
			System.is(type,Number);
			type;
			var bb = {
				a:'',
				b:1
			}
			var bc = 'label';
			var bj = 3;
			var bt = {
				a:'sss',
				b:99
			}
			var be = 'a';
			var bf = 'b';
			var bg = [];
			bg.push('b');
			var v12 = {}
			var v13 = v12[1];
			var v14 = [1];
			var v15 = v14[0];
			it('keyof',()=>{
				this['dynamic']='[1]';
				var v16 = this['dynamic'];
				expect('[1]').toEqual(v16);
				var bh = this.testKeyof(bt,'a');
				var fs = this.testKeyof(bt,'b');
				expect('sss').toEqual(bh);
				expect(99).toEqual(fs);
				var bfd = {
					name:'6699'
				}
				var fdb = this.testKeyof(bfd,'name');
				expect('6699').toEqual(fdb);
				var getNamessFun = this.testKeyof(this,'getNamess');
				expect(this.getNamess).toEqual(getNamessFun);
				var bdfs4 = getNamessFun('sssss');
			});
			var b9 = function(name,callback){
				var b = callback;
				var n = b(1);
				var v = callback(1);
				return '';
			}
			it('keyof',()=>{
				function tNames(){
					return 1;
				}
				var b10 = tNames;
				var b11 = b10();
				expect(1).toEqual(1);
				var bst9 = Test('111','11111');
				expect('111').toEqual(bst9.getNamess('111'));
			});
		}
	},
	testKeyof:{
		m:"1",
		id:"3",
		value:function testKeyof(t,k){
			return t[k];
		}
	},
	getClassTestGenerics:{
		m:"1",
		id:"3",
		value:function getClassTestGenerics(name,age){
			var a = [age,name];
			return a;
		}
	},
	getTestGenerics:{
		m:"1",
		id:"3",
		value:function getTestGenerics(name,age){
			var t = Test('name',name);
			return age;
		}
	},
	getTestObject:{
		m:"1",
		id:"3",
		value:function getTestObject(flag){
			const factor = ()=>{
				const o = {}
				o.test=Test('name',1);
				o.name="test";
				return o.test;
			}
			var o = factor();
			return o;
		}
	},
	getNamess:{
		m:"3",
		id:"3",
		value:function getNamess(s){
			return s;
		}
	},
	testAwait:{
		m:"1",
		id:"3",
		value:function testAwait(){
			it("test Await",(done)=>{
				const res = this.loadRemoteData(1);
				res.then((data)=>{
					expect(data[0]).toEqual(['one',1]);
					expect(data[1]).toEqual({
						bss:['two',2],
						cc:['three',3]
					});
					expect(data[2]).toEqual(['three',3]);
					done();
				});
			});
			it("test for Await",(done)=>{
				const res = this.loadRemoteData(2);
				res.then((data)=>{
					expect(data[0]).toEqual(['0',0]);
					expect(data[1]).toEqual(['1',1]);
					expect(data[2]).toEqual(['2',2]);
					expect(data[3]).toEqual(['3',3]);
					expect(data[4]).toEqual(['4',4]);
					done();
				});
			});
			it("test switch Await",(done)=>{
				const res = this.loadRemoteData(3);
				res.then((data)=>{
					expect(data).toEqual(['four',4]);
					done();
				});
			});
			it("test switch and for Await",(done)=>{
				const res = this.loadRemoteData(4);
				res.then((data)=>{
					expect(data).toEqual([['five',5],['0',0],['1',1],['2',2],['3',3],['4',4]]);
					done();
				});
			});
			it("test switch and for Await",(done)=>{
				const res = this.loadRemoteData(5,1);
				res.then((data)=>{
					expect(data).toEqual(['one-9999',1]);
					done();
				});
			});
			it("test switch and for Await",(done)=>{
				const res = this.loadRemoteData(5,2);
				res.then((data)=>{
					expect(data).toEqual(['two-9999',2]);
					done();
				});
			});
			it("test switch and for Await",(done)=>{
				const res = this.loadRemoteData(6,1);
				res.then((data)=>{
					expect(data).toEqual(['one-9999',1]);
					done();
				});
			});
			it("test switch and for Await",(done)=>{
				const res = this.loadRemoteData(6,2);
				res.then((data)=>{
					expect(data).toEqual(['two-9999',2]);
					done();
				});
			});
			it("test switch and for Await",(done)=>{
				const res = this.loadRemoteData3(1);
				res.then((data)=>{
					expect(data).toEqual(['one-9999',1]);
					done();
				});
			});
			it("test switch and for Await",(done)=>{
				const res = this.loadRemoteData3(4);
				res.then((data)=>{
					expect(data).toEqual('Invalid index 4');
					done();
				});
			});
			Reflect.get(Test,this.getJson(),name);
		}
	},
	getJson:{
		m:"3",
		id:"3",
		value:function getJson(){
			return {
				name:123
			}
		}
	},
	testTuple:{
		m:"3",
		id:"3",
		value:function testTuple(){
			const data = this.method("end",9);
			it("test tuple",()=>{
				expect(data).toEqual([['a','b'],[1],[1,1,'one'],['one',['one',1],'three','four',['end',9]]]);
			});
		}
	},
	len:{
		m:"1",
		id:"2",
		value:5
	},
	currentIndex:{
		m:"1",
		id:"1",
		writable:"true",
		value:0
	},
	next:{
		m:"3",
		id:"3",
		value:function next(){
			if(! (this[_private].currentIndex < this[_private].len)){
				return {
					value:null,
					done:true
				}
			}
			const d = {
				value:this[_private].currentIndex++,
				done:false
			}
			return d;
		}
	},
	rewind:{
		m:"3",
		id:"3",
		value:function rewind(){
			this[_private].currentIndex=0;
		}
	},
	restFun:{
		m:"3",
		id:"3",
		value:function restFun(...types){
			return types;
		}
	},
	tetObject:{
		m:"3",
		id:"3",
		value:function tetObject(){
			var t = Test('1',1);
			var b = t;
			var ii = {
				bb:b
			}
			return ii.bb;
		}
	},
	loadData:{
		m:"3",
		id:"3",
		value:function loadData(){}
	},
	iuuu:{
		m:"3",
		id:"4",
		enumerable:"true",
		get:function iuuu(){
			var ii = this.name;
			if(6){
				ii=[];
			}
			ii=true;
			return ii;
		}
	},
	data:{
		m:"3",
		id:"4",
		enumerable:"true",
		get:function data(){
			var b = [];
			if(4){
				b=this.avg;
			}
			b=this.avg;
			const dd = ()=>{
				var bs = Promise((resolve,reject)=>{
					setTimeout(()=>{
						resolve([]);
					},100);
				});
				return bs;
			}
			return b;
		}
	},
	fetchApi:{
		m:"3",
		id:"3",
		value:function fetchApi(name,data,delay){
			return Promise((resolve,reject)=>{
				setTimeout(()=>{
					resolve([name,data]);
				},delay);
			});
		}
	},
	loadRemoteData2:{
		m:"3",
		id:"3",
		value:function loadRemoteData2(){
			return await this.fetchApi("one",1,800);
		}
	},
	loadRemoteData:{
		m:"3",
		id:"3",
		value:function loadRemoteData(type,index=1){
			if(type === 5){
				try{
					return index == 1 ? await this.fetchApi("one-9999",1,800) : index == 2 ? ["two-9999",2] : await this.fetchApi("three-9999",3,800);
				}catch(e){
					console.log(e);
				}
			}
			if(type === 6){
				return index >= 2 ? index == 2 ? ["two-9999",2] : await this.fetchApi("three-9999",3,800) : await this.fetchApi("one-9999",1,800);
			}
			if(type === 1){
				var a = await this.fetchApi("one",1,800);
				var bs = {
					bss:await this.fetchApi("two",2,500)
				}
				var c = await this.fetchApi("three",3,900);
				bs.cc=c;
				return [a,bs,c];
			}else{
				var list = [];
				switch(type){
					case 3 :
						const b = await this.fetchApi("four",4,300);
						return b;
					case 4 :
						const bb = await this.fetchApi("five",5,1200);
						list.push(bb);}
				for(var i = 0;i < 5;i++){
					list.push(await this.fetchApi(i + '',i,100));
				}
				list.entries();
				return list;
			}
		}
	},
	method:{
		m:"3",
		id:"3",
		value:function method(name,age){
			Person.prototype.method.call.this(name,age);
			var str = ["a","b"];
			var b = ["one",["one",1]];
			var cc = [1];
			var x = [1,1,'one'];
			b.push('three');
			b.push('four');
			b.push([name,age]);
			return [str,cc,x,b];
		}
	},
	name:{
		m:"3",
		id:"4",
		enumerable:"true",
		get:function name(){
			return Person[Class.key].members.name.get.call(this);
		},
		set:function name(value){
			Person[Class.key].members.name.set.call(this,value);
		}
	},
	avg:{
		m:"3",
		id:"3",
		value:function avg(yy,bbc){
			var ii = ()=>1;
			var bb = ['1'];
			function name(i){
				var b = i;
				i.avg('');
				i.method('',1);
				return b;
			}
			const person = Person('');
			name(person);
			const bbb = name(person);
			name(person);
			var dd = [1,1,"2222","66666","8888"];
			var a1,a2,a3 = dd;
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
		}
	},
	map:{
		m:"3",
		id:"3",
		value:function map(){
			const ddss = {
				name:function(c,b){
					var id = b;
					return c;
				}
			}
			return ddss;
		}
	},
	address:{
		m:"1",
		id:"3",
		value:function address(){
			const dd = [];
			const bb = {
				global:1,
				private:1
			}
			dd.push(1);
			return dd;
		}
	},
	loadRemoteData3:{
		m:"3",
		id:"3",
		value:function loadRemoteData3(index=1){
			if(index < 5){
				try{
					if(index == 4){
						throw Error("Invalid index " + (index) + "");
					}
					return index == 1 ? await this.fetchApi("one-9999",1,800) : await this.fetchApi("two-9999",2,300);
				}catch(e){
					return e.message;
				}
			}else{
				return null;
			}
		}
	},
	[Symbol.iterator]:{
		m:"3",
		id:"3",
		value:function(){
			return this;
		}
	}
}
Class.creator("0",Test,{
	id:"1",
	ns:"",
	name:"Test",
	dynamic:"true",
	imps:[TestInterface],
	inherit:"Person",
	methods:"methods",
	members:"members"
});
module.exports=Test;