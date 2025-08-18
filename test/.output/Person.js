const Class = require("./Class.js");
const TestInterface = require("./com/TestInterface.js");
const _private0 = Class.getKeySymbols("3bcc71a4");
function Person(name){
    Object.defineProperty(this,_private0,{
        value:{
            _name:'',
            _type:null
        }
    });
    this.addressName=`the Person properyt "addressName"`;
    Object.call(this);
    this[_private0]._name=name;
}
Class.creator(Person,{
    m:2049,
    name:"Person",
    dynamic:true,
    private:_private0,
    imps:[TestInterface],
    inherit:Object,
    members:{
        addressName:{
            m:2064,
            writable:true,
            enumerable:true
        },
        _name:{
            m:8208,
            writable:true
        },
        _type:{
            m:8208,
            writable:true
        },
        target:{
            m:2176,
            enumerable:true,
            get:function target(){
                return this;
            }
        },
        setType:{
            m:2112,
            value:function setType(a){
                this[_private0]._type=a;
                var _private = 1;
                return a;
            }
        },
        method:{
            m:2112,
            value:function method(name,age){
                var str = ["a","1"];
                var b = ["",["1",1]];
                var cc = [1];
                var x = [1,1,'2222',[{}]];
                b.push('1');
                b.push(['1',1]);
                var c = -1968;
                var bs = 22.366;
                var bssd = -22.366;
                Person.prototype.address.call(this.target);
                return "sssss";
            }
        },
        name:{
            m:2176,
            enumerable:true,
            get:function name(){
                return this[_private0]._name;
            },
            set:function name(val){
                this[_private0]._name=val;
            }
        },
        avg:{
            m:2112,
            value:function avg(a,b){
                return a;
            }
        },
        address:{
            m:8256,
            value:function address(data){}
        },
        addressNamesss:{
            m:4160,
            value:function addressNamesss(){
                arguments.length;
            }
        },
        testWhen:{
            m:2112,
            value:function testWhen(){
                return 1;
            }
        }
    }
});
module.exports=Person;