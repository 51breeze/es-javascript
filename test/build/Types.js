import Class from "./core/Class.js";
function Types(){}
const methods = {
	ADDRESS:{
		m:3,
		id:6,
		value:0
	},
	0:{
		m:3,
		id:5,
		value:"ADDRESS"
	},
	NAME:{
		m:3,
		id:6,
		value:1
	},
	1:{
		m:3,
		id:5,
		value:"NAME"
	}
}
Class.creator(9,Types,{
	id:1,
	name:"Types",
	methods:methods
});
module.exports=Types;