"use strict";
/*declare System*/
var System=(function(){
	function System(){
	    throw new SyntaxError('System is not constructor.');
	};
	var __modules__=[];
	System.__KEY__=Symbol("__KEY__");
	System.getClass=function(id){
	    return __modules__[id];
	}
	System.setClass=function(id,classObject,description){
	    if( description ){
	        if( description.inherit ){
	            Object.defineProperty(classObject,"prototype",{value:Object.create(description.inherit.prototype)});
	        }
	        if( description.methods ){
	            Object.defineProperties(classObject,description.methods);
	        }
	        if( description.members ){
	            Object.defineProperties(classObject.prototype,description.members);
	        }
	        Object.defineProperty(classObject,System.__KEY__,{value:description});
	        Object.defineProperty(classObject,"name",{value:description.name});
	    }
	    Object.defineProperty(classObject.prototype,"constructor",{value:classObject});
	    __modules__[id] = classObject;
	}
	System.isClass=function(classObject){
	    if( !classObject || !classObject.constructor)return false;
	    var desc = classObject[ System.__KEY__ ];
	    return desc && desc.id === 1 || (typeof classObject === "function" && classObject.constructor !== Function);
	}
	System.isInterface=function(classObject){
	    var desc = classObject && classObject[ System.__KEY__ ];
	    return desc && desc.id === 2;
	}
	System.isEnum=function(classObject){
	    var desc = classObject && classObject[ System.__KEY__ ];
	    return desc && desc.id === 3;
	}
	System.isFunction=function(target){
	   return target && target.constructor === Function;
	}
	System.toArray=function toArray(object){
	    if( Array.isArray(object) ){
	        return object;
	    }
	    var arr = [];
	    for(var key in object){
	        if( Object.prototype.hasOwnProperty.call(object,key) ){
	            arr.push(object[key]);
	        } 
	    }
	    return arr;
	}
	System.isArray=function isArray(object){
	    return Array.isArray(object); 
	}
	System.getIterator=function getIterator(object){
	    if( !object )return null;
	    if( object[Symbol.iterator] ){
	        return object[Symbol.iterator]();
	    }
	    var type = typeof object;
	    if( type==="object" || type ==="boolean" || type ==="number" || object.length === void 0 ){
	        throw new TypeError("object is not iterator");
	    }
	    return (function(object){ 
	        return{
	            index:0,
	            next:function next(){
	                if (this.index < object.length) {
	                    return {value:object[this.index++],done:false};
	                }
	                return {value:undefined,done:true};
	            }
	        };
	    })(object);
	}
	System.is=function is(left,right){
	    if(!left || !right || typeof left !== "object")return false;
	    var rId = right[System.__KEY__] ? right[System.__KEY__].id : null;
	    var description =  left.constructor ? left.constructor[System.__KEY__] : null;
	    if( rId === 0 && description && description.id === 1 ){
	        return (function check(description,id){
	            if( !description )return false;
	            var imps = description.imps;
	            var inherit = description.inherit;
	            if( inherit === right )return true;
	            if( imps ){
	                for(var i=0;i<imps.length;i++){
	                    if( imps[i] === right || check( imps[i][System.__KEY__], 0 ) )return true;
	                }
	            }
	            if( inherit && inherit[ System.__KEY__ ].id === id){
	                return check( inherit[System.__KEY__], 0);
	            }
	            return false;
	        })(description,1);
	    }
	    return left instanceof right;
	}
	
	System.awaiter = function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}
	
	System.generator = function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (_) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	}
	return System;
}());
/*interface com.TestInterface*/
(function(System){
	function TestInterface(){}
	System.setClass(1,TestInterface,{
		id:2,
		ns:"com",
		name:"TestInterface"
	});
}(System));
/*class Person*/
(function(System){
	var TestInterface = System.getClass(1);
	var _private=Symbol("private");
	function Person(name){
		Object.defineProperty(this,_private,{value:{"_name":'',"_type":null}});
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
	
	}};
	members.address={m:1,d:3,value:function address(){
	
	}};
	members.addressNamesss={m:2,d:3,value:function addressNamesss(){
	
	}};
	System.setClass(0,Person,{
		id:1,
		ns:"",
		name:"Person",
		private:_private,
		imps:[TestInterface],
		inherit:Object,
		members:members
	});
}(System));
/*declare Reflect*/
(function(System){
	var _Reflect = (function(_Reflect){
	    var _construct = _Reflect ? _Reflect.construct : function construct(theClass,args){
	        if( !System.isFunction( theClass ) ){
	            throw new TypeError('is not class or function');
	        }
	        switch ( args.length ){
	            case 0 :
	                return new theClass();
	            case 1 :
	                return new theClass(args[0]);
	            case 2 :
	                return new theClass(args[0], args[1]);
	            case 3 :
	                return new theClass(args[0], args[1], args[2]);
	            case 4 :
	                return new theClass(args[0], args[1], args[2],args[3]);
	            case 5 :
	                return new theClass(args[0], args[1], args[2],args[3],args[4]);
	            case 6 :
	                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5]);
	            case 7 :
	                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6]);
	            case 8 :
	                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6],args[7]);
	            default :
	                return Function('f,a', 'return new f(a[' + System.range(0, args.length).join('],a[') + ']);')(theClass, args);
	        }
	    };
	
	    var _apply = _Reflect ? _Reflect.apply : function apply(target, thisArgument, argumentsList){
	        if( typeof target !== "function" ){
	            throw new TypeError('is not function');
	        }
	        thisArgument = thisArgument === target ? undefined : thisArgument;
	        if (argumentsList != null) {
	            return target.apply(thisArgument === target ? undefined : thisArgument, argumentsList);
	        }
	        if (thisArgument != null) {
	            return target.call(thisArgument);
	        }
	        return target();
	    };
	
	    var MODIFIER_PUBLIC=3;
	    var MODIFIER_PROTECTED=2;
	    var MODIFIER_PRIVATE=1;
	
	    function inContext(context,objClass){
	        if( !System.isClass(objClass) )return;
	        var inherit = context[ System.__KEY__ ].inherit;
	        if( inherit === objClass ){
	            return true;
	        }
	        return inContext(inherit, objClass);
	    }
	
	    function description(scope,target,name){
	        var isstatic = System.isClass(target);
	        var objClass = isstatic ? target : target.constructor;
	        var context = System.isClass(scope) ? scope : null;
	        var description = null;
	        if( !System.isClass(objClass) ){
	            return null;
	        }
	        while( objClass && (description = objClass[ System.__KEY__ ]) ){
	            var dataset = isstatic ? description.methods : description.members;
	            if( dataset.hasOwnProperty( name ) ){
	                const desc = dataset[name];
	                switch( desc.m & MODIFIER_PUBLIC ){
	                    case MODIFIER_PRIVATE :
	                        return  context === objClass ? desc : false;
	                    case MODIFIER_PROTECTED :
	                        return context && inContext(context,objClass) ? desc : false;
	                    default :
	                        return desc;
	                }
	            }
	            objClass = description.inherit;
	            if( objClass === Object ){
	                return null;
	            }
	        }
	        return null;
	    };
	
	    function Reflect(){ 
	        throw new SyntaxError('Reflect is not constructor.');
	    }
	
	    Reflect.apply=function apply(target, thisArgument, argumentsList ){
	        if( !System.isFunction( target ) ){
	            throw new TypeError('target is not function');
	        }
	        if( !System.isArray(argumentsList) ){
	            argumentsList = argumentsList !== void 0 ? [argumentsList] : [];
	        }
	        return _apply(target, thisArgument, argumentsList);
	    };
	
	    Reflect.call=function call(scope,target,propertyKey,argumentsList,thisArgument){
	        if( target == null )throw new ReferenceError('target is null or undefined');
	        if( propertyKey==null ){
	            return Reflect.apply(target, thisArgument, argumentsList);
	        }
	        return Reflect.apply( Reflect.get(scope,target,propertyKey), thisArgument||target, argumentsList);    
	    };
	
	    Reflect.construct=function construct(target, args){
	        if( !System.isClass(target) )throw new TypeError('target is not class');
	        return _construct(target, args || []);
	    };
	
	    Reflect.deleteProperty=function deleteProperty(target, propertyKey){
	        if( !target || propertyKey==null )return false;
	        if( propertyKey==="__proto__")return false;
	        if( System.isClass(target) || System.isClass(target.constructor) ){
	            return false;
	        }
	        if( Object.prototype.hasOwnProperty( target, propertyKey) ){
	            return (delete target[propertyKey]);
	        }
	        return false;
	    };
	
	    Reflect.has=function has(target, propertyKey){
	        if( propertyKey==null || target == null )return false;
	        if( propertyKey==="__proto__")return false;
	        if( System.isClass(target) || System.isClass(target.constructor) ) {
	            return false;
	        }
	        return propertyKey in target;
	    };
	
	    var DECLARE_PROPERTY_ACCESSOR = 4;
	    Reflect.get=function(scope,target,propertyKey,receiver){
	        if( propertyKey==null )return target;
	        if( propertyKey === '__proto__' )return null;
	        if( target == null )throw new ReferenceError('target is null or undefined');
	        if(!(System.isClass(target) || System.isClass(target.constructor))){
	            return target[ propertyKey ];
	        }
	        var desc = description(scope,target,propertyKey);
	        if( desc === false ){
	            throw new ReferenceError(`target.${propertyKey} inaccessible`);
	        }
	        if( !desc ){
	            throw new ReferenceError(`target.${propertyKey} is not exists.`);
	        }
	        receiver = receiver || target;
	        if(typeof receiver !=="object" ){
	            throw new ReferenceError(`target.${propertyKey} assignmented receiver can only is an object.`);
	        }
	        if( desc.d === DECLARE_PROPERTY_ACCESSOR ){
	            if( !desc.get ){
	                throw new ReferenceError(`target.${propertyKey} getter is not exists.`);
	            }
	            return desc.get.call(receiver);
	        }
	        return desc.value;
	    };
	
	    var DECLARE_PROPERTY_ACCESSOR = 4;
	    var DECLARE_PROPERTY_VAR = 1;
	
	    Reflect.set=function(scope,target,propertyKey,value,receiver){
	        if( propertyKey==null )return target;
	        if( propertyKey === '__proto__' )return null;
	        if( target == null )throw new ReferenceError('target is null or undefined');
	        if(!(System.isClass(target) || System.isClass(target.constructor))){
	            target[ propertyKey ] = value;
	            return;
	        }
	
	        var desc = description(scope,target,propertyKey);
	        if( desc === false ){
	            throw new ReferenceError(`target.${propertyKey} inaccessible`);
	        }
	        if( !desc ){
	            throw new ReferenceError(`target.${propertyKey} is not exists.`);
	        }
	        receiver = receiver || target;
	        if(typeof receiver !=="object" ){
	            throw new ReferenceError(`target.${propertyKey} assignmented receiver can only is an object.`);
	        }
	        if( desc.d === DECLARE_PROPERTY_ACCESSOR ){
	            if( !desc.set ){
	                throw new ReferenceError(`target.${propertyKey} setter is not exists.`);
	            }
	            desc.set.call(receiver);
	        }else if( desc.d === DECLARE_PROPERTY_VAR ){
	            if( System.isClass(target) ){
	                target[propertyKey] = value;
	            }else if( System.isClass(target.constructor) ){
	                var p = target.constructor[System.__KEY__]._private;
	                target[p][propertyKey] = value;
	            }else {
	                throw new ReferenceError(`target.${propertyKey} non object.`); 
	            }
	        }else{
	            throw new ReferenceError(`target.${propertyKey} is not writable.`);
	        }
	    };
	
	    Reflect.incre=function incre(scope,target,propertyKey,flag){
	        var val = Reflect.get(scope,target,propertyKey);
	        var result = val+1;
	        Reflect.set(scope,target, propertyKey, result);
	        return flag !== false ? val : result;
	    }
	
	    Reflect.decre= function decre(scope,target, propertyKey,flag){
	        var val = Reflect.get(scope,target, propertyKey);
	        var result = val-1;
	        Reflect.set(scope,target, propertyKey,result);
	        return flag !== false ? val : result;
	    }
	    return Reflect;
	
	}(Reflect));
	System.setClass(2,_Reflect);
}(System));
/*enum Types*/
(function(System){
	function Types(){}
	const methods = {};
	methods.ADDRESS={m:3,d:6,value:0};
	methods[0]={m:3,d:5,value:"ADDRESS"};
	methods.NAME={m:3,d:6,value:1};
	methods[1]={m:3,d:5,value:"NAME"};
	System.setClass(3,Types,{
		id:3,
		ns:"",
		name:"Types",
		inherit:Object,
		methods:methods
	});
}(System));
/*class Test*/
(function(System){
	var Person = System.getClass(0);
	var TestInterface = System.getClass(1);
	var Reflect = System.getClass(2);
	var Types = System.getClass(3);
	var _private=Symbol("private");
	function Test(name,age){
		Object.defineProperty(this,_private,{value:{"bbss":'bbss',"age":40,"len":5,"currentIndex":0}});
		Person.call(this,name);
		Person.prototype.setType.call(this,'1');
		this.target;
	}
	var methods = {};
	methods.getClass={m:3,d:3,value:function getClass(){
		var a = Test;
		var buname = {a:1};
		buname.test=a;
		buname.person=Person;
		var test=buname.test;
		test.getClassObject();
		return buname;
	}};
	methods.getClassObject={m:3,d:3,value:function getClassObject(){
		var a = Test;
		var b = {test:a};
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
			var once = {two:{three:three,four:bsp}};
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
			var labels = ["name","data","target","addressName","iuuu"];
			for(var key in _this){
				expect(key).toBe(labels[labels.indexOf(key)]);
				expect(Reflect.get(Test,_this,key)).toBe(Reflect.get(Test,_this,key));
			}
		});
	}};
	members.testComputeProperty={m:1,d:3,value:function testComputeProperty(){
		var bname = "123";
		var _c1,_c,o = (_c={},
			_c[bname]=1,
			_c["sssss"]=2,
			_c.uuu=(_c1={},
				_c1[bname]=3,
				_c1),
			_c);
		it("compute property should is true ",function(){
			expect(o[bname]).toBe(1);
			expect(o.uuu[bname]).toBe(3);
			expect(o.uuu["123"]).toBe(3);
			Reflect.set(Test,o["uuu"],bname,true);
			expect(Reflect.get(Test,o["uuu"],bname)).toBe(true);
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
			array.push(val);
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
		var ccc = ddee.name({name:1,age:1},"123");
		var cccww = dd.name({name:1,age:30},666);
		var types = '333';
		var _c2,bds = (_c2={},
			_c2.name=123,
			_c2[types]=1,
			_c2);
		Reflect.set(Test,bds,types,99);
		it("Generics should is true",function(){
			expect(typeof _this.avg("test")).toBe('string');
			expect(ccc.name.toFixed(2)).toBe("1.00");
			expect(cccww.age).toBe(30);
		});
		it("class Generics",function(){
			let obj = _this.getTestObject(true);
			var bd = obj;
			var bs = obj.getNamess(1);
			expect(bs.toFixed(2)).toBe("1.00");
		});
		var bsint = this.getTestGenerics('sssss');
		var bsstring = this.getTestGenerics("ssss",'age');
		var bd = bsstring;
		let obj = this.getTestObject(true);
		var bsddd = obj.getNamess(1);
		var sss = obj.getClassTestGenerics(1,1);
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
				expect(Reflect.get(Test,data,1)).toEqual({bss:['two',2],cc:['three',3]});
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
		Reflect.get(Test,this.getJson(),"name");
	}};
	members.getJson={m:3,d:3,value:function getJson(){
		return {name:123};
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
		if(!(this[_private].currentIndex < this[_private].len)){
			return {value:null,done:true};
		}
		const d = {value:this[_private].currentIndex++,done:false};
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
		var ii = {bb:b};
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
						bs = {bss:_a.sent()};
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
						list.push(bb);
						return [3,9];
					case 9:
						i=0;
						_a.label=10;
					case 10:
						if( !(i < 5) )return [3, 13];
						return [4,this.fetchApi(i + '',i,100)];
					case 11:
						list.push(_a.sent());
						_a.label=12;
					case 12:
						i++;
						return [3, 10];
					case 13:
						list.entries();
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
		return Person[System.__KEY__].members.name.get.call(this);
	},set:function name(value){
		Person[System.__KEY__].members.name.set.call(this,value);
	}};
	members.avg={m:3,d:3,value:function avg(yy,bbc){
		var ii = function(){
		return 1;
		};
		var bb = ['1'];
		function name(i){
			var b = i;
			i.avg();
			i.method('',1);
			return b;
		}
		const person = new Person('');
		name(person);
		const bbb = name(person);
		name(person);
		var dd = [1,1,"2222","66666","8888"];
		bb.push();
		dd.push(1);
		return yy;
	}};
	members.map={m:3,d:3,value:function map(){
		const ddss = {name:function(c,b){
			var id = b;
			return c;
		}};
		return ddss;
	}};
	members.address={m:1,d:3,value:function address(){
		const dd = [];
		const bb = {global:1,private:1};
		dd.push(1);
		return dd;
	}};
	members[Symbol.iterator]={value:function(){return this;}}
	System.setClass(4,Test,{
		id:1,
		ns:"",
		name:"Test",
		private:_private,
		inherit:Person,
		methods:methods,
		members:members
	});
}(System));
/*externals code*/;
(function(){
	var Test = System.getClass(4);
	const test = new Test('Test');
	test.start();
}());