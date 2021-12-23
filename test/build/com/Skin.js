import Component from "./../web/components/Component.js";
import State from "./State.js";
import Class from "./../core/Class.js";
var _private=Symbol("private");
function Skin(){
Component.apply(this,Array.prototype.slice.call(arguments));
}
var members = {};
members.state={m:3,d:4,enumerable:true,get:function state(){
	return new State('name');
},set:function state(vlaue){

}};
members.stateGroup={m:3,d:4,enumerable:true,get:function stateGroup(){
	return [this.state];
},set:function stateGroup(value){

}};
members.states={m:3,d:4,enumerable:true,set:function states(vlaue){

}};
members.render={m:2,d:3,value:function render(){
		var createElement = this.createElement.bind(this);
	return createElement('div',null, (this.slot('foot') || []).concat((this.slot('default') || [])));
}};
Class.creator(12,Skin,{
	'id':1,
	'ns':'com',
	'name':'Skin',
	'private':_private,
	'inherit':Component,
	'members':members
});
export default Skin;