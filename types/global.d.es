declare interface Storage{
    const length:number;
    setItem(name:string,value:string):void;
    getItem(name:string):string;
    removeItem(name:string):void;
    key(index:number):string;
    clear():void;
}

declare const sessionStorage:Storage;
declare const localStorage:Storage;

declare ImmediateID extends Number{}

declare System{
   
    static registerHook(type:'httpRequestCreated', processer:(value?:net.Http)=>void, priority:number=0):void;
    static registerHook(type:'httpRequestSendBefore', processer:(value?:net.Http,config?:net.HttpConfig)=>void, priority:number=0):void;
    static hasRegisterHook(type:string, processer?:Function):boolean;
    static registerProvide(name:string, value:any, prefix?:string ):void;
    static getProvide<T=any>(name:string, prefix?:string ):T;
    static setImmediate(callback:(...args)=>void, ...args):ImmediateID;
    static clearImmediate(id:ImmediateID):void;
}