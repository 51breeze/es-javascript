const Class = require("./Class.js");
const Http = require("axios");
function Request(){}
Class.creator(Request,{
    m:513,
    name:"Request",
    methods:{
        _init:{
            m:2312,
            writable:true,
            value:null
        },
        init:{
            m:800,
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
            m:800,
            value:function post(url,data){
                Request.init().post(url,data).then((value)=>{});
            }
        }
    }
});
module.exports=Request;