/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<references from='EventDispatcher' />
const hasOwn = Object.prototype.hasOwnProperty;
function System(){
    throw new SyntaxError('System is not constructor.');
};
System.getIterator=function getIterator(object){
    if( !object )return null;
    if( object[Symbol.iterator] ){
        return object[Symbol.iterator]();
    }
    const type = typeof object;
    if( type==="object" || type ==="boolean" || type ==="number" || object.length === void 0 ){
        throw new TypeError("object is not iterator");
    }
    return (function(object){ 
        return{
            index:0,
            next:function next(){
                if (this.index < object.length) {
                    return {index:this.index,value:object[this.index++],done:false};
                }
                return {value:undefined,done:true};
            }
        };
    })(object);
}

System.awaiter = function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

System.generator = function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

System.is=function is(left,right){
    if(!left || !right || typeof left !== "object")return false;
    const rId = right[Class.key] ? right[Class.key].id : null;
    const description =  left.constructor ? left.constructor[Class.key] : null;
    if( rId === 0 && description && description.id === 1 ){
        return (function check(description,id){
            if( !description )return false;
            var imps = description.imps;
            var inherit = description.inherit;
            if( inherit === right )return true;
            if( imps ){
                for(var i=0;i<imps.length;i++){
                    if( imps[i] === right || check( imps[i][Class.key], 0 ) )return true;
                }
            }
            if( inherit && inherit[ Class.key ].id === id){
                return check( inherit[Class.key], 0);
            }
            return false;
        })(description,1);
    }
    return left instanceof right;
}

System.isClass=function isClass(classObject){
    if( !classObject || !classObject.constructor)return false;
    const desc = classObject[ Class.key ];
    return desc && desc.id === Class.CONSTANT.MODULE_CLASS;
}

System.isInterface=function isInterface(classObject){
    const desc = classObject && classObject[ Class.key ];
    return desc && desc.id === Class.CONSTANT.MODULE_INTERFACE;
}

System.isFunction=function isFunction(target){
   return target && target.constructor === Function;
}

System.isArray=function isArray(object){
    return Array.isArray(object); 
}

System.toArray=function toArray(object){
    if( Array.isArray(object) ){
        return object;
    }
    if(object && typeof object ==='object' && object[Symbol.iterator] && System.isClass(object)){
        const iterable = object[Symbol.iterator]();
        iterable.rewind();
        let result = null;
        const arr = [];
        while( (result = iterable.next()) && !result.done ){
            arr.push( result.value );
        }
        return arr;
    }
    return Array.from( object );
}

System.forEach=function forEach(object, callback){
    if( !object )return;
    const type = typeof object;
    if( type ==='number'){
        for(let i=0; i<object;i++){
            callback(i, i, object);
        }
    }else if( type ==='string'){
        for(let i=0; i<object.length;i++){
            callback(object[i], i, object);
        }
    }else if( Array.isArray(object) || object instanceof Map ){
        object.forEach( callback );
    }else if( type ==="object" ){
        if(object[Symbol.iterator] && System.isClass(object)){
            var iterable = object[Symbol.iterator]();
            iterable.rewind();
            var result = null;
            var index = 0;
            while( (result = iterable.next()) && !result.done ){
                callback(result.value, result.key || index, object);
                index++;
            }
        }else if( Object.prototype.toString.call(object) === '[object Object]' ){
            for(let name in object){
                callback(object[name], name, object);
            }
        }else{
            Array.from( object ).forEach( callback );
        }  
    }
}

var __EventDispatcher = null;
System.getEventDispatcher=function getEventDispatcher(){
    if( __EventDispatcher === null ){
        __EventDispatcher = new EventDispatcher(window);
    }
    return __EventDispatcher;
}

/**
 * 根据指定的类名获取类的对象
 * @param name
 * @returns {Object}
 */
 System.getDefinitionByName = function getDefinitionByName(name){
     const module = Class.getClassByName(name);
     if( module ){
         return module;
     }
     throw new TypeError('"' + name + '" is not defined.');
 };
 
 System.hasClass = function hasClass(name){
     return !!Class.getClassByName(name);
 };

 System.firstUpperCase=function firstUpperCase(value){
    if(!value)return value;
    value = String(value);
    return value.substring(0,1).toUpperCase()+value.substring(1);
 }

 System.firstLowerCase=function firstLowerCase(value){
    if(!value)return value;
    value = String(value);
    return value.substring(0,1).toLowerCase()+value.substring(1);
 }

 const globalConfig = Object.create(null);
 System.setConfig=function setConfig(key, value){
    key = String(key);
    const segments = key.split('.').map( seg=>seg.trim() ).filter( seg=>!!seg );
    if( !segments.length ){
        throw new Error(`The '${key}' key-name invalid. in System.setConfig`)
    }
    let name = null;
    let object = globalConfig;
    key = segments.pop();
    while( name = segments.shift() ){
        if( !hasOwn.call(object,name) ){
            object = object[name] = {};
        }else{
            object = object[name];
        }
    }
    object[key] = value;
 }

 System.getConfig=function getConfig(key){
    key = String(key);
    const segments = key.split('.').map( seg=>seg.trim() ).filter( seg=>!!seg );
    if( !segments.length ){
        throw new Error(`The '${key}' key-name invalid. in System.getConfig`)
    }
    let name = null;
    let object = globalConfig;
    key = segments.pop();
    while( name = segments.shift() ){
        if( !hasOwn.call(object,name) ){
           return null;
        }else{
            object = object[name];
        }
    }
    return hasOwn.call(object,key) ? object[key] : null;
 }

 System.createHttpRoute=function createHttpRoute(url, params, flag=false){
    params = params || {};
    url = String(url).trim();
    url = url.replace(/(^|\/)<([^\>\?]+)(\?)?>/g, function(a,b,c,d){
        let key = c;
        let value = null;
        let prefix = b ? b : '';
        if( hasOwn.call(params,key) ){
            value = params[key];
            if(flag){
                params[key]=null;
                delete params[key];
            }
        }else if( hasOwn.call(params,key) || hasOwn.call(params,key=key.toLowerCase()) ){
            value = params[key];
            if(flag){
                params[key]=null;
                delete params[key];
            }
        }
        if( d && d.charCodeAt(0) === 63 ){
            if( value !== null ){
                return prefix+value;
            }else{
                return '';
            }
        }
        if( value === null ){
            throw new Error(`Missing params '${key}' or the value of params cannot for null.`);
        }else{
            return prefix+value;
        }
    });
    return url.replace(/\/$/,'');
 }

 var HTTP_REQUEST = null;
 System.createHttpRequest=function(HttpFactor, route, rawConfig){
    rawConfig = rawConfig || {};
    let data  = rawConfig.data;
    let _params = route.param || route.params || rawConfig.param || rawConfig.params
    let params = _params && typeof _params ==='object' ? Object.assign({}, _params) : {};
    let url = route;
    let method = rawConfig.method || rawConfig.methods;
    if( typeof route ==='object' ){
        if(route.default && typeof route.default ==='object'){
            params = Object.assign(route.default, params);
        }
        url = System.createHttpRoute(route.url, params, true);
        if( route.allowMethod && route.allowMethod !== '*'){
            let allowMethod = route.allowMethod;
            if( !Array.isArray(allowMethod) ) {
                allowMethod = [allowMethod];
            }
            if( !allowMethod.includes('*') ){
                if( method ){
                    if(!allowMethod.includes(method) ){
                        throw new Error(`Http request is not allowed '${method}' methods. available methods for ${allowMethod.join(',')} on the '${url}' url`);
                    }
                }else if( !method ){
                    if( data && allowMethod.includes('post') ){
                        method = 'post';
                    }else{
                        method = allowMethod[0];
                    }
                }
            }
        }
    }

    if( !data && String(method).toLowerCase() ==='post' ){
        data = params;
        params = void 0;
    }

    let request = HTTP_REQUEST;
    let config = Object.create(null);
    if( rawConfig.options && typeof rawConfig.options ==='object' ){
        config = Object.assign(config, rawConfig.options);
    }

    config = Object.assign(config,{
        url:url,
        method:method,
        params:params,
        data:data
    });

    if( !request ){
        const initConfig = Object.assign(
            Object.create(null),
            System.getConfig('http.request')
        );
        request = HTTP_REQUEST = HttpFactor.create(initConfig);
        System.invokeHook('httpRequestCreated', request);
    }

    System.invokeHook('httpRequestSendBefore', request, config);
    return request.request(config);
}

const globalInvokes = Object.create(null);
const invokeRecords = {};
System.invokeHook=function invokeHook(type, ...args){
    const items = globalInvokes[type];
    const len = items && items.length;
    if( !hasOwn.call(invokeRecords, type) ){
        invokeRecords[type] = {type, items:[], called:[]};
    }
    const records = invokeRecords[type];
    if( !records.items.some( arr=>{
        if(arr.length !== args.length)return false;
        return args.every( (item,index)=>arr[index]===item );
    })){
        records.items.push(args);
    }
    return len > 0 ? _invokeHook(items, args, records) : args[0];
}

function _invokeHook(items, args, records){
    let len = items && items.length;
    let result = args[0];
    if( len > 0 ){
        let i = 0;
        let ctx = {
            stop:false,
            previous:null
        };
        args = args.slice(1);
        for(;i<len;i++){
            const [invoke] = items[i];
            if(!records.called.includes(invoke) ){
                records.called.push(invoke);
                result = invoke.call(ctx, result, ...args);
                if( ctx.stop ){
                    return result;
                }
                ctx.previous = result;
            }
        }
    }
    return result;
}

System.registerHook=function registerHook(type, processer, priority){
    if( typeof processer !== 'function' ){
        throw new Error(`System.registerInvoke processer must is Function`);
    }else{

        if( typeof priority !== "number" || isNaN(priority) ){
            priority = 0;
        }

        if( !hasOwn.call(globalInvokes, type) ){
            globalInvokes[type] = [];
        }

        const items = globalInvokes[type];
        items.push( [processer,priority] );
        if( items.length > 1 ){
            items.sort( (a, b)=>{
                if( a[1] == b[1] )return 0;
                return a[1] > b[1] ? -1 : 1;
            });
        }

        if( hasOwn.call(invokeRecords, type) ){
            const records = invokeRecords[type];
            records.items.forEach( args=>{
                _invokeHook(items, args, records)
            });
        }
    }
}

System.hasRegisterHook=function hasRegisterHook(type, processer){
    if( hasOwn.call(globalInvokes, type) ){
        const items = globalInvokes[type];
        if(processer){
            return items.some(item=>item[0] === processer);
        }
        return true;
    }
    return false;
}

const globalProvides = Object.create(null);
System.registerProvide=function registerProvide(name, value, prefix='global'){
    if( name && typeof name === "string" ){
        const key = prefix+':'+name;
        if( hasOwn.call(globalProvides, key) ){
            throw new Error(`Provider arguments the '${name}' already exists.`);
        }else{
            globalProvides[key] = value;
        }
    }else{
        throw new Error(`Provider arguments the name is not a string.`);
    }
}

System.getProvide=function getProvide(name, prefix='global'){
    if( name && typeof name === "string" ){
        const key = prefix+':'+name;
        if( hasOwn.call(globalProvides, key) ){
            return globalProvides[key];
        }else{
           return null;
        }
    }else{
        throw new Error(`Provider arguments the name is not a string.`);
    }
}
 
 /**
  * 返回类的完全限定类名
  * @param value 需要完全限定类名称的对象。
  * 可以将任何类型、对象实例、原始类型和类对象
  * @returns {string}
  */
 System.getQualifiedClassName = function getQualifiedClassName( target ){
     if( target == null )throw new ReferenceError( 'target is null or undefined' );
     if( target===System )return 'System';
     if( typeof target === "function" && target.prototype){
        const desc = target && target[ Class.key ];
        if( desc ){
            return desc.ns ? desc.ns+'.'+desc.name : desc.name;
        }
        var str = target.toString();
        str = str.substr(0, str.indexOf('(') );
        return str.substr(str.lastIndexOf(' ')+1);
     }
     throw new ReferenceError( 'target is not Class' );
 };
 
 /**
  * 返回对象的完全限定类名
  * @param value 需要完全限定类名称的对象。
  * 可以将任何类型、对象实例、原始类型和类对象
  * @returns {string}
  */
 System.getQualifiedObjectName = function getQualifiedObjectName( target ){
     if( target == null || typeof target !== "object"){
         throw new ReferenceError( 'target is not object or is null' );
     }
     return System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
 };
 /**
  * 获取指定实例对象的超类名称
  * @param value
  * @returns {string}
  */
 System.getQualifiedSuperClassName =function getQualifiedSuperClassName(target){
     if( target == null )throw new ReferenceError( 'target is null or undefined' );
     const classname = System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
     const module = Class.getClassByName(classname);
     if( module ){
         return System.getQualifiedClassName( module.inherit || Object );
     }
     return null;
 };

 (function(System){
    const env = {
        'BROWSER_IE': 'IE',
        'BROWSER_FIREFOX': 'FIREFOX',
        'BROWSER_CHROME': 'CHROME',
        'BROWSER_OPERA': 'OPERA',
        'BROWSER_SAFARI': 'SAFARI',
        'BROWSER_MOZILLA': 'MOZILLA',
        'NODE_JS': 'NODE_JS',
        'IS_CLIENT': false,
    };
    var _platform = [];
    if (typeof navigator !== "undefined"){
        let ua = navigator.userAgent.toLowerCase();
        let s;
        (s = ua.match(/msie ([\d.]+)/)) ? _platform = [env.BROWSER_IE, parseFloat(s[1])] :
        (s = ua.match(/firefox\/([\d.]+)/)) ? _platform = [env.BROWSER_FIREFOX, parseFloat(s[1])] :
        (s = ua.match(/chrome\/([\d.]+)/)) ? _platform = [env.BROWSER_CHROME, parseFloat(s[1])] :
        (s = ua.match(/opera.([\d.]+)/)) ? _platform = [env.BROWSER_OPERA, parseFloat(s[1])] :
        (s = ua.match(/version\/([\d.]+).*safari/)) ? _platform = [env.BROWSER_SAFARI, parseFloat(s[1])] :
        (s = ua.match(/^mozilla\/([\d.]+)/)) ? _platform = [env.BROWSER_MOZILLA, parseFloat(s[1])] : null;
        env.IS_CLIENT = true;
    }else{
        if(typeof process !== 'undefined' && process.versions){
            _platform = [env.NODE_JS, process.versions.node];
        }else{
            _platform = ['OTHER', 0];
        }
    }

    /**
     * 获取当前运行平台
     * @returns {*}
     */
    env.platform = function platform(name, version){
        if ( typeof name === "string" ){
            name = name.toUpperCase();
            if( version > 0 )return name == _platform[0] && env.version( version );
            return name == _platform[0];
        }
        return _platform[0];
    };

    env.setPlatform=function setPlatform(name, version, isClient=false){
        _platform=[name,version];
        if(isClient){
            env.IS_CLIENT = true;
        }
    }

    /**
     * 判断是否为指定的浏览器
     * @param type
     * @returns {string|null}
     */
    env.version = function version(value, expr) {
        var result = _platform[1];
        if (value == null)return result;
        value = parseFloat(value);
        switch (expr) {
            case '=' :
                return result == value;
            case '!=' :
                return result != value;
            case '>' :
                return result > value;
            case '>=' :
                return result >= value;
            case '<=' :
                return result <= value;
            case '<' :
                return result < value;
            default:
                return result <= value;
        }
    };
    System.env = env;
}(System));


(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        System.setImmediate = global.setImmediate;
        System.clearImmediate = global.clearImmediate;
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    System.setImmediate = setImmediate;
    System.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));