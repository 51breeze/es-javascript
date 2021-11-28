import com_Skin from "./com/Skin.js";
import Class from "./core/Class.js";
var _private=Symbol("private");
function PersonSkin(options){	com_Skin.call(this, options);}
var members = {};
members.render={m:3,d:3,value:function render(createElement){
	return createElement('div',null, [
		createElement('div',{
			"class":""
			}, [
			createElement('div',null, ['item'])
		])
	]);
}};
Class.creator(6,PersonSkin,{
	'id':1,
	'ns':'',
	'name':'PersonSkin',
	'members':members,
	'private':_private,
	'inherit':com_Skin
});
	com_Skin.makeComponent('PersonSkin', PersonSkin, {
		
});
export default PersonSkin;