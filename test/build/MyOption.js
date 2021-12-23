import SelectOption from "element-ui/packages/option";
import Class from "./core/Class.js";
var _private=Symbol("private");
function MyOption(){
SelectOption.apply(this,Array.prototype.slice.call(arguments));
}
var members = {};
members.render={m:3,d:3,value:function render(){
	return SelectOption.prototype.render.call(this);
}};
Class.creator(10,MyOption,{
	'id':1,
	'ns':'',
	'name':'MyOption',
	'private':_private,
	'inherit':SelectOption,
	'members':members
});
export default MyOption;