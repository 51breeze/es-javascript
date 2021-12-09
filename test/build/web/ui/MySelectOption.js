var _private=Symbol("private");
import SelectOption from "./SelectOption.js";
import Component from "./../components/Component.js";
import Class from "./../../core/Class.js";
var MySelectOption = Component.createComponent({
	name:'MySelectOption',
	extends:SelectOption,
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
	return createElement('div',null, [
			createElement(SelectOption,{
				"props":Object.assign({},this.data(), {'name':"ssss"})
				})
		]);
}};
members._init={value:function _init(options){
(function (options){
SelectOption.prototype._init.call(this,options);
}).call(this,options);
}}
Class.creator(10,MySelectOption,{
	'id':1,
	'ns':'web.ui',
	'name':'MySelectOption',
	'private':_private,
	'inherit':SelectOption,
	'members':members
});
export default MySelectOption;