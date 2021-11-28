import Component from "./../web/components/Component.js";
import State from "./State.js";
import Class from "./../core/Class.js";
var _private=Symbol("private");
function Skin(){
Component.call(this);;
}
var members = {};
members.state={m:3,d:4,configurable:true,enumerable:true,get:function state(){
	return new State('name');
},set:function state(vlaue){

}};
members.stateGroup={m:3,d:4,configurable:true,enumerable:true,get:function stateGroup(){
	return [this.state];
},set:function stateGroup(value){

}};
members.states={m:3,d:4,configurable:true,enumerable:true,set:function states(vlaue){

}};
Class.creator(7,Skin,{
	'id':1,
	'ns':'com',
	'name':'Skin',
	'private':_private,
	'inherit':Component,
	'members':members
});
Component.makeComponent('Skin', Skin, {
	props:{
		state:{type:null},
		stateGroup:{type:Array},
		states:{type:Array}
	}
});
export default Skin;