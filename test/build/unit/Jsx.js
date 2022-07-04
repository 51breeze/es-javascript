const Class = require("./../core/Class.js");
function Jsx(){}
const members = {
	start:{
		m:3,
		id:3,
		value:function start(){
			createElement("div");
		}
	}
}
Class.creator(9,Jsx,{
	id:1,
	ns:"unit",
	name:"Jsx",
	members:members
});
module.exports=Jsx;