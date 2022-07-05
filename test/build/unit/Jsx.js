const Class = require("./../core/Class.js");
function Jsx(){}
const members = {
	change:{
		m:3,
		id:3,
		value:function change(e){}
	},
	start:{
		m:3,
		id:3,
		value:function start(){
			const createElement = arguments[0];
			return createElement("div",{
				attrs:{
					id:"ssss"
				}
			},(1 ? [
				createElement("div",null,["the is condition"])
			] : [
				createElement("div",null,["the is else"]),
				createElement("div",null,["the is else"])
			]).concat(this.slot("default") || [
				createElement("div",{
					slot:"default"
				},["test"])
			],(function(_refs){
				var __refs = [];
				for(var _itemKey in _refs){
					var item = _refs[_itemKey];
					__refs.push(item === 1 ? createElement("div",{
						on:{
							click:(e)=>e,
							change:this.change.bind(this)
						},
						class:"ssss"
					},[
						createElement("div",{
							staticStyle:"dssdsdf",
							style:{}
						},[item]),
						createElement("div",null,["6666"])
					]) : null);
				}
				return __refs;
			}).call(this,[]),(function(_refs){
				var __refs = [];
				var index = 0;
				for(var key in _refs){
					var val = _refs[key];
					__refs.push([
						createElement("div",null,[val]),
						index == 1 ? createElement("div",null,["999"]) : index == 2 ? createElement("div",null,["22222"]) : createElement("div",{
							directives:[{
								name:"show",
								value:index == 3
							}]
						},["888"])
					]);
					index++;
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