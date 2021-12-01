import Event from "./../../core/Event.js";
import Class from "./../../core/Class.js";
var _private=Symbol("private");
function ComponentEvent(type,bubbles,cancelable){
	Event.call(this,type);
}
var methods = {};
methods.COMPONENT_BEFORE_CREATE={m:3,d:2,enumerable:true,value:'componentBeforeCreate'};
methods.COMPONENT_BEFORE_MOUNT={m:3,d:2,enumerable:true,value:'componentBeforeMount'};
methods.COMPONENT_BEFORE_UPDATE={m:3,d:2,enumerable:true,value:'componentBeforeUpdate'};
methods.COMPONENT_BEFORE_DESTROY={m:3,d:2,enumerable:true,value:'componentBeforeDestroy'};
methods.COMPONENT_ERROR_CAPTURED={m:3,d:2,enumerable:true,value:'componentErrorCaptured'};
Class.creator(8,ComponentEvent,{
	'id':1,
	'ns':'web.components',
	'name':'ComponentEvent',
	'private':_private,
	'inherit':Event,
	'methods':methods
});
export default ComponentEvent;