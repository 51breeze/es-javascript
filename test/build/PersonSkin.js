import Class from "./core/Class.js";
var _private=Symbol("private");
function PersonSkin(options){
	Object.defineProperty(this,_private,{value:{'test':'sss','_name':'Yejun','_list':null}});
	web_components_Skin.call(this, options);
}
var members = {};
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
members.render={m:3,d:3,value:function render(createElement){
	var name = this.name;
	var list = this.list;
	var createElement = this.$createElement;
	return createElement('div',null, [
		name ? createElement('div',null, ['1']) : 
		name ? createElement('div',null, ['2']) : 
		createElement('div',null, ['3']),
		createElement('div',null, ['3'])
	].concat(
		list.map((function(item){
			return !name ? createElement('div',null, [
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
								for(var _itemValueKey in item){
									var itemValue = item[_itemValueKey];
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
		}).bind(this)),
		this.$slots['default'],
		(this.$scopedSlots['foot'] ? this.$scopedSlots['foot']({props:{"name":this.name}}) : null),
		(this.$scopedSlots['body'] ? this.$scopedSlots['body']({props:{"name":this.name}}) : [
			createElement('div',{
				"slot":'body'
				}, ['sssssssssss'])
		])));
}};
Class.creator(10,PersonSkin,{
	'id':1,
	'ns':'',
	'name':'PersonSkin',
	'private':_private,
	'inherit':web_components_Skin,
	'members':members
});
web_components_Skin.makeComponent('PersonSkin', PersonSkin, {
	props:{
		name:{type:String},
		list:{type:Array}
	},
	data:{
		test:'sss',
		_name:'Yejun',
		_list:null
	}
});
export default PersonSkin;