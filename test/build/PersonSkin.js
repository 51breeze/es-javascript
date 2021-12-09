var _private=Symbol("private");
import "./assets/style.css";
import web_components_Component from "./web/components/Component.js";
import Class from "./core/Class.js";
var PersonSkin = web_components_Component.createComponent({
	name:'PersonSkin',
	props:{
		name:{type:String},
		list:{type:Array},
		value:{type:String}
	},
	data:function data(){return {
		test:'sss',
		_name:'Yejun',
		_list:null
	};}
});
var members = {};
members.render={m:3,d:3,value:function render(createElement){
	var createElement = this.$createElement;
	return createElement('div',null, [
		this.name ? createElement('div',null, ['1']) : 
		this.name ? createElement('div',null, ['2']) : 
		createElement('div',null, ['3']),
		[].concat(this.list).map((function(item){
			return !this.name ? createElement('div',{
					"attrs":{
					"default":"props"
					}
					}, [
					createElement('div',null, ['sssssssssss']),
					createElement('div',{
						"class":"ssss"
						}, [
						createElement('div',null, 
							(function(item){
								var _item = [];
								if( typeof item ==='number' ){
									item = Array.from({length:item}, function(v,i){return i;});
								}
								var Index=0;
								for(var name in item){
									var itemValue = item[name];
									_item.push(createElement('div',{
										"class":""
										}, [
										createElement('div',null, [itemValue])
									]));
									Index++;
								}
								return _item;
							}).call(this,item).concat([
							createElement('span',null, ['======'])
						]))
					])
				]) : null;
		}).bind(this))
	].concat((this.$slots['default']||[]),
		[
		createElement('input',{
			"attrs":{
			"value":this.value
			},
			"on":{
			"input":(function(event){this.value=event && event.target && event.target.value || event;}).bind(this),
			"change":this.onChange
			},
			"domProps":{
			"value":this.value
			}
			})
	],
		(this.$scopedSlots['foot'] ? this.$scopedSlots['foot']({props:{"name":this.name}}) : null),
		(this.$scopedSlots['body'] ? this.$scopedSlots['body']({props:{"name":this.name}}) : [
			createElement('div',{
				"slot":'body'
				}, ['sssssssssss'])
		])));
}};
members.test={m:1,d:1,configurable:true,writable:true,value:'sss'};
members.mounted={m:3,d:3,value:function mounted(){

}};
members._name={m:1,d:1,configurable:true,writable:true,value:'Yejun'};
members.name={m:3,d:4,configurable:true,enumerable:true,get:function name(){
	return this[_private]._name;
},set:function name(value){
	this[_private]._name=value;
}};
members.list={m:3,d:4,configurable:true,enumerable:true,get:function list(){
	return this[_private]._list || ['ssss','sssss'];
},set:function list(value){
	this[_private]._list=value;
}};
members._list={m:1,d:1,configurable:true,writable:true,value:null};
members.onChange={m:3,d:3,value:function onChange(){

}};
members.value={m:3,d:4,configurable:true,enumerable:true,get:function value(){
	return this.data('value') || '9999';
},set:function value(val){
	this.data('value',val);
}};
members._init={value:function _init(options){
(function (options){
	Object.defineProperty(this,_private,{value:{'test':'sss','_name':'Yejun','_list':null}});
}).call(this,options);
}}
Class.creator(9,PersonSkin,{
	'id':1,
	'ns':'',
	'name':'PersonSkin',
	'private':_private,
	'members':members
});
export default PersonSkin;