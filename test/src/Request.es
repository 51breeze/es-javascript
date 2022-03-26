package;


import net.Http;

class Request{

    static private var _init:Http=null; 

    static init(){

        if( Request._init ){
            return Request._init ;
        }
        
        const service = Request._init =  Http.create({timeout:5000});
        service.interceptors.request.use(
            config => {
                return config
            },
            error => {
                // do something with request error
                console.log(error) // for debug
                return Promise.reject(error)
            }
        );
        return Request._init;
    }

    static post(url,data){

        Request.init().post<string>(url,data).then( (value)=>{

        })
    }
}

