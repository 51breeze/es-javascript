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
declare System{
    static const env:EnvInterface;
    static forMap<T=any>(target, callback:(item:any, key:string|number)=>T):T[]
    static registerHook(type:'httpRequestCreated', processer:(value?:net.Http)=>void, priority:number=0):void;
    static registerHook(type:'httpRequestSendBefore', processer:(value?:net.Http,config?:net.HttpConfig)=>void, priority:number=0):void;
    static registerOnceHook(type:string,processer:(...args)=>void, priority:number=0):any;
    static dispatchHook(type:string,...args):any;
    static removeHook(type:string,processer?:Function):boolean;
    static hasRegisterHook(type:string, processer?:Function):boolean;
    static setImmediate(callback:(...args)=>void, ...args):number;
    static clearImmediate(id:number):void;
}

declare interface EnvInterface{
    isClient():boolean;
    platform(name:string,version?):boolean;
    version(value, operator?:string):boolean;
    isMobile():boolean;
    referrer():string;
}

declare class Proxy{
    static revocable<T extends object>(target: T, handler: ProxyHandler<T>): { proxy: T, revoke: () => void};
    constructor<T extends object>(target:T, handler:ProxyHandler<T>):T;
}

declare interface ProxyHandler<T extends object> {
    apply?(target: T, thisArg: any, argArray: any[]): any;
    construct?(target: T, argArray: any[], newTarget: Function): object;
    defineProperty?(target: T, p: string, attributes: PropertyDescriptor): boolean;
    deleteProperty?(target: T, p: string): boolean;
    get?(target: T, p: string, receiver: any): any;
    getOwnPropertyDescriptor?(target: T, p: string): PropertyDescriptor;
    getPrototypeOf?(target: T): object | null;
    has?(target: T, p: string): boolean;
    isExtensible?(target: T): boolean;
    ownKeys?(target: T): ArrayLike<string>;
    preventExtensions?(target: T): boolean;
    set?(target: T, p: string, value: any, receiver: any): boolean;
    setPrototypeOf?(target: T, v: object | null): boolean;
}

declare interface PropertyDescriptor {
    configurable?: boolean;
    enumerable?: boolean;
    value?: any;
    writable?: boolean;
    get?(): any;
    set?(v: any): void;
}