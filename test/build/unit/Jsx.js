const Class = require("./../core/Class.js");
function Jsx(){}
const members = {
	start:{
		m:3,
		id:3,
		value:function start(){
			return createElement("div",{
				attrs:{
					id:"ssss"
				}
			},(1 ? [
				createElement("div",null,[
					"the is condition"
				])
			] : [
				createElement("div",null,[
					"the is else"
				]),
				createElement("div",null,[
					"the is else"
				])
			]).concat(this.slot("default") || [
				createElement("div",{
					slot:"default"
				},[
					"test"
				])
			],(function(_refs){
				var __refs = [];
				if(typeof _refs === "number"){
					_refs=Array.from({
						length:_refs
					},function(v,i){
						return i;
					});
				}
				for(var _itemKey in _refs){
					var item = _refs[_itemKey];
					__refs.push(createElement("div",{
						class:"ssss"
					},[
						createElement("div",null,[
							item
						])
					]));
				}
				return __refs;
			}).call(this,[]),(function(_refs){
				var __refs = [];
				if(typeof _refs === "number"){
					_refs=Array.from({
						length:_refs
					},function(v,i){
						return i;
					});
				}
				for(var key in _refs){
					var val = _refs[key];
					__refs.push([
						createElement("div",null,[
							val
						])
					]);
				}
				return __refs;
			}).call(this,{}).reduce(function(acc, val){return acc.concat(val)},[])));
		}
	}
}
Class.creator(9,Jsx,{
	id:1,
	ns:"unit",
	name:"Jsx",
	members:members
});
module.exports=Jsx;