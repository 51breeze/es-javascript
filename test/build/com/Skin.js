var _private=Symbol("private");
import Component from "./../web/components/Component.js";
import State from "./State.js";
import PersonSkin from "./../PersonSkin.js";
import Vue from "vue/dist/vue.js";
import Class from "./../core/Class.js";
var Skin = Vue.extend({
	name:'Skin',
	extends:Component,
	props:{
		state:{type:null},
		stateGroup:{type:Array},
		states:{type:Array}
	}
});
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
members.render={m:3,d:3,value:function render(c){
		var createElement = this.$createElement;
	return createElement(PersonSkin,{
			"scopedSlots":{
			"foot":this.$scopedSlots['foot'] || (function(scope){return ['ssssssssssssssss',scope.props
			]}).bind(this)
			}
			}, this.$slots['default'] || ['=========default===========']);
}};
members._init={value:function _init(options){
(function Skin(){
Component.prototype._init.call(this);
}).call(this,options);
}}
Class.creator(6,Skin,{
	'id':1,
	'ns':'com',
	'name':'Skin',
	'private':_private,
	'inherit':Component,
	'members':members
});
export default Skin;