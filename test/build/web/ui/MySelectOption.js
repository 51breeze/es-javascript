var _private=Symbol("private");
import "element-ui/lib/theme-chalk/select.css";
import SelectOption from "element-ui/packages/option";
import Vue from "vue/dist/vue.js";
import Class from "./../../core/Class.js";
import Component from "./../components/Component.js";
var MySelectOption = Vue.extend({
	name:'MySelectOption',
	extends:Class.property(Component,'inherit').call(null,SelectOption),
	props:{
		value:{type:String}
	}
});
var members = {};
members.value={m:3,d:4,configurable:true,enumerable:true,get:function value(){
	return this.data('value');
},set:function value(value){
	this.data('value',value);
}};
members.render={m:3,d:3,value:function render(){
		var createElement = this.$createElement;
	return createElement(SelectOption,{
			"props":Object.assign({},this.data(), {'name':"ssss"})
			});
}};
members._init={value:function _init(options){
(function MySelectOption(){
SelectOption.prototype._init.call(this);
}).call(this,options);
}}
Class.creator(10,MySelectOption,{
	'id':1,
	'ns':'web.ui',
	'name':'MySelectOption',
	'private':_private,
	'inherit':MySelectOption.options.extends,
	'members':members
});
export default MySelectOption;