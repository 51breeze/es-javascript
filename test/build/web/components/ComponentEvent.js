import Event from "./../../core/Event.js";
import Class from "./../../core/Class.js";
var _private=Symbol("private");
function ComponentEvent(type,bubbles,cancelable){
	Event.call(this,type);
}
var methods = {};
methods.BEFORE_CREATE={m:3,d:2,enumerable:true,value:'componentBeforeCreate'};
methods.BEFORE_MOUNT={m:3,d:2,enumerable:true,value:'componentBeforeMount'};
methods.BEFORE_UPDATE={m:3,d:2,enumerable:true,value:'componentBeforeUpdate'};
methods.BEFORE_DESTROY={m:3,d:2,enumerable:true,value:'componentBeforeDestroy'};
methods.ERROR_CAPTURED={m:3,d:2,enumerable:true,value:'componentErrorCaptured'};
methods.UPDATED={m:3,d:2,enumerable:true,value:'componentUpdated'};
methods.MOUNTED={m:3,d:2,enumerable:true,value:'componentMounted'};
methods.CREATED={m:3,d:2,enumerable:true,value:'componentCreated'};
methods.ACTIVATED={m:3,d:2,enumerable:true,value:'componentActivated'};
methods.DEACTIVATED={m:3,d:2,enumerable:true,value:'componentDeactivated'};
methods.DESTROYED={m:3,d:2,enumerable:true,value:'componentDestroyed'};
Class.creator(6,ComponentEvent,{
	'id':1,
	'ns':'web.components',
	'name':'ComponentEvent',
	'private':_private,
	'inherit':Event,
	'methods':methods
});
export default ComponentEvent;