var Http = require("axios");
var Class = require("./core/Class.js");
var _private=Symbol("private");
function Request(){
}
var methods = {};
methods._init={m:1,d:1,writable:true,value:null};
methods.init={m:3,d:3,value:function init(){
	if(Request._init){
		return Request._init;
	}
	const service = Request._init=Http.create({"timeout":5000});
	service.interceptors.request.use(function(config){
		return config;
	},function(error){
		console.log(error);
		return Promise.reject(error);
	});
	return Request._init;
}};
methods.post={m:3,d:3,value:function post(url,data){
	Request.init().post(url,data).then(function(value){

	});
}};
Class.creator(3,Request,{
	'id':1,
	'ns':'',
	'name':'Request',
	'private':_private,
	'methods':methods
}, false);
module.exports=Request;