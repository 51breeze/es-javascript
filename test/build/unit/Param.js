const Class = require("./../core/Class.js");
function Param(){}
const members = {
	start:{
		m:3,
		id:3,
		value:function start(){
			var en = (en={},en[en["name1000"]=6]="name1000",en[en["age"]=7]="age");
			var b = en.age;
			var result = this.getList(en,[9,5]);
			it("test getList",()=>{
				expect(6).toBe(result);
			});
			this.ave(2.3660);
		}
	},
	getList:{
		m:3,
		id:3,
		value:function getList({name1000:name1000,age:age=9},[index,id=20]){
			var args = [index,id];
			it("test call",()=>{
				var b = this.call(...args);
				expect(5).toBe(b);
			});
			return name1000;
		}
	},
	call:{
		m:3,
		id:3,
		value:function call(index,id){
			return id;
		}
	},
	ave:{
		m:3,
		id:3,
		value:function ave(age){
			return age;
		}
	}
}
Class.creator(8,Param,{
	id:1,
	ns:"unit",
	name:"Param",
	members:members
});
module.exports=Param;