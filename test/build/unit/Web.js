const Reflect = require("./../core/Reflect.js");
const Class = require("./../core/Class.js");
const Web = web_components_Component.createComponent({
	name:"es-Web"
});
const members = {
	_init:{
		m:3,
		id:3,
		value:function _init(options){
			this.addEventListener("onBeforeCreate",(function(e){
				this.addProvider(this.provide.bind(this));
			}).bind(this));
		}
	},
	address:{
		m:3,
		id:undefined,
		enumerable:true,
		get:function address(){
			return this.reactive("address",void 0,function(){
				return 'addresssss--------999';
			});
		},
		set:function address(value){
			this.reactive("address",value);
		}
	},
	provide:{
		m:3,
		id:3,
		value:function provide(){
			return {
				foot:this.formValue
			}
		}
	},
	formValue:{
		m:3,
		id:undefined,
		enumerable:true,
		get:function formValue(){
			return this.reactive("formValue",void 0,function(){
				return {
					name:'99999',
					ids:[],
					hhh:'',
					select:''
				}
			});
		},
		set:function formValue(value){
			this.reactive("formValue",value);
		}
	},
	name:{
		m:3,
		id:4,
		enumerable:true,
		get:function name(){
			return this.reactive('name');
		},
		set:function name(value){
			this.reactive('name',value);
		}
	},
	list:{
		m:3,
		id:4,
		enumerable:true,
		get:function list(){
			return ['one','two','three','four','five'];
		}
	},
	onChange:{
		m:3,
		id:3,
		value:function onChange(e){
			this.address=Reflect.get(Web,Reflect.get(Web,e,"target"),"value") + '---';
		}
	},
	value:{
		m:3,
		id:4,
		enumerable:true,
		get:function value(){
			return this.reactive('value') || '9999';
		},
		set:function value(val){
			this.reactive('value',val);
		}
	},
	beforeEnter:{
		m:3,
		id:3,
		value:function beforeEnter(){
			console.log('=========PersonSkin=====enter',this.name,this.isShow);
		}
	},
	isShow:{
		m:3,
		id:undefined,
		enumerable:true,
		get:function isShow(){
			return this.reactive("isShow",void 0,function(){
				return true;
			});
		},
		set:function isShow(value){
			this.reactive("isShow",value);
		}
	},
	getTag:{
		m:3,
		id:3,
		value:function getTag(){
			const createElement = this.createElement.bind(this);
			return createElement("Tag",null,["ssssssss"]);
		}
	},
	render:{
		m:3,
		id:3,
		value:function render(){
			const createElement = this.createElement.bind(this);
			return createElement(Component,null,[
				this.name ? createElement("div",{
					class:'bg'
				},["1"]) : !(this.name) ? createElement("div",null,["2"]) : createElement("div",null,["399999"])
			].concat(
				['china'].concat(this.list).map((function(item){
					return createElement("div",null,[
						createElement("div",null,[item]),
						createElement("div",{
							class:"ssss"
						},[
							createElement("div",null,[
								createElement("span",null,[].concat(
									this.slot("default") || []
								))
							])
						])
					]);
				}).bind(this)),
				createElement("div",{
					ref:'iss',
					class:""
				},[
					createElement("div",null,[
						"item =====PersonSkin====  ",
						this.name,
						"====="
					])
				]),
				(function(_refs){
					var __refs = [];
					for(var index in _refs){
						var item = _refs[index];
						__refs.push(createElement("div",null,[
							item,
							"----for---",
							index
						]));
					}
					return __refs;
				}).call(this,this.list),
				list.map((item)=>{
					return createElement("div",null,[
						"--------",
						item,
						"--internal----"
					]);
				}),
				createElement("input",{
					attrs:{
						value:this.formValue.name
					},
					on:{
						input:(function(){
							this.formValue.name=event && event.target && event.target.nodeType===1 ? event.target.value : event;
						}).bind(this),
						change:(e)=>this.onChange(e)
					},
					directives:[{
						name:"model",
						value:this.formValue.name
					}]
				}),
				createElement("input",{
					attrs:{
						value:this.formValue.name
					}
				}),
				this.slot("foot",true,true,{}) || [
					createElement("div",{
						slot:"foot"
					},["===============the is foot slot =============="])
				],
				createElement("div",{
					directives:[{
						name:"show",
						value:this.isShow
					}]
				},[
					"the is property   "
				].concat(
					this.address
				)),
				createElement("button",{
					on:{
						click:(function(){
							this.isShow=!this.isShow
						}).bind(this)
					}
				},["Toggle    "]),
				this.isShow ? [
					createElement("div",null,["the is a group condition"]),
					createElement("div",null,["the is a group condition"]),
					createElement("div",null,["the is a group condition"]),
					createElement("div",null,["the is a group condition"]),
					createElement("div",null,["the is a group condition"]),
					createElement("div",null,["the is a group condition"])
				] : [
					createElement("div",null,["the is a group elseif"])
				],
				this.list.map((function(item,index){
					return [
						createElement("div",null,[
							"====each==",
							item,
							"=",
							index
						]),
						createElement("div",null,[
							"===22=each==",
							item,
							"="
						])
					];
				}).bind(this)).reduce(function(acc, val){return acc.concat(val)},[]),
				(function(_refs){
					var __refs = [];
					for(var keyName in _refs){
						var item = _refs[keyName];
						__refs.push([
							createElement("div",null,[
								"====for===",
								item,
								",",
								keyName
							]),
							createElement("div",null,[
								"===222=for===",
								item,
								",",
								keyName
							])
						]);
					}
					return __refs;
				}).call(this,this.list).reduce(function(acc, val){return acc.concat(val)},[]),
				createElement("div",{
					directives:[{
						name:"show",
						value:this.isShow
					}]
				},["====show=="]),
				createElement("div",{
					directives:[{
						name:"show",
						value:this.isShow
					}]
				},["===222=show==="]),
				this.getTag()
			));
		}
	}
}
Class.creator(10,Web,{
	id:1,
	ns:"unit",
	name:"Web",
	members:members
});
module.exports=Web;