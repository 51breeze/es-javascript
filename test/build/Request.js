import Class from "./core/Class.js";
const methods = {
	_init:{
		m:1,
		id:1,
		writable:true,
		value:null
	},
	init:{
		m:3,
		id:3,
		value:function init(){
			if(Request._init){
				return Request._init;
			}
			const service = Request._init=Http.create({
				timeout:5000
			});
			service.interceptors.request.use((config)=>{
				return config;
			},(error)=>{
				console.log(error);
				return Promise.reject(error);
			});
			return Request._init;
		}
	},
	post:{
		m:3,
		id:3,
		value:function post(url,data){
			Request.init().post(url,data).then((value)=>{});
		}
	}
}
Class.creator(5,Request,{
	id:1,
	name:"Request",
	methods:methods
});
module.exports=Request;