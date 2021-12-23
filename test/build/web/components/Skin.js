import Component from "./Component.js";
import EventDispatcher from "./../../core/EventDispatcher.js";
import Event from "./../../core/Event.js";
import Class from "./../../core/Class.js";
var _private=Symbol("private");
function Skin(hostComponent){
	Object.defineProperty(this,_private,{value:{'_hostComponent':null,'_event':null}});
	this[_private]._hostComponent=hostComponent;
	this[_private]._event=new EventDispatcher(this);
}
var members = {};
members._hostComponent={m:1,d:1,writable:true,value:null};
members._event={m:1,d:1,writable:true,value:null};
members.hostComponent={m:3,d:4,enumerable:true,get:function hostComponent(){
	return this[_private]._hostComponent;
}};
members.data={m:3,d:3,value:function data(name,value){
	return this.hostComponent.data(name,value);
}};
members.forceUpdate={m:3,d:3,value:function forceUpdate(){
	return this.hostComponent.forceUpdate();
}};
members.getElementByRefName={m:3,d:3,value:function getElementByRefName(name){
	return this.hostComponent.getElementByRefName(name);
}};
members.slot={m:3,d:3,value:function slot(name,scope,called,params){
	return this.hostComponent.slot(name,scope,called,params);
}};
members.createElement={m:3,d:3,value:function createElement(name,data,children){
	return this.hostComponent.createElement(name,data,children);
}};
members.render={m:3,d:3,value:function render(){
		var createElement = this.createElement.bind(this);
	return createElement('div');
}};
members.addEventListener={m:3,d:3,value:function addEventListener(type,listener){
	this[_private]._event.addEventListener(type,listener);
	return this;
}};
members.dispatchEvent={m:3,d:3,value:function dispatchEvent(event){
	return this[_private]._event.dispatchEvent(event);
}};
members.removeEventListener={m:3,d:3,value:function removeEventListener(type,listener){
	return this[_private]._event.removeEventListener(type,listener);
}};
members.hasEventListener={m:3,d:3,value:function hasEventListener(type,listener){
	return this[_private]._event.hasEventListener(type,listener);
}};
Class.creator(7,Skin,{
	'id':1,
	'ns':'web.components',
	'name':'Skin',
	'private':_private,
	'members':members
});
export default Skin;