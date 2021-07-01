function System(){
    throw new SyntaxError('System is not constructor.');
};
var __modules__=[];
System.__KEY__=Symbol("__KEY__");
System.getClass=function(id){
    return __modules__[id];
}
System.setClass=function(id,classObject,description){
    if( description ){
        if( description.inherit ){
            Object.defineProperty(classObject,"prototype",{value:Object.create(description.inherit.prototype)});
        }
        if( description.methods ){
            Object.defineProperties(classObject,description.methods);
        }
        if( description.members ){
            Object.defineProperties(classObject.prototype,description.members);
        }
        Object.defineProperty(classObject,System.__KEY__,{value:description});
        Object.defineProperty(classObject,"name",{value:description.name});
    }
    Object.defineProperty(classObject.prototype,"constructor",{value:classObject});
    __modules__[id] = classObject;
}
System.isClass=function(classObject){
    if( !classObject || !classObject.constructor)return false;
    var desc = classObject[ System.__KEY__ ];
    return desc && desc.id === 1 || (typeof classObject === "function" && classObject.constructor !== Function);
}
System.isInterface=function(classObject){
    var desc = classObject && classObject[ System.__KEY__ ];
    return desc && desc.id === 2;
}
System.isEnum=function(classObject){
    var desc = classObject && classObject[ System.__KEY__ ];
    return desc && desc.id === 3;
}
System.isFunction=function(target){
   return target && target.constructor === Function;
}
System.toArray=function toArray(object){
    if( Array.isArray(object) ){
        return object;
    }
    var arr = [];
    for(var key in object){
        if( Object.prototype.hasOwnProperty.call(object,key) ){
            arr.push(object[key]);
        } 
    }
    return arr;
}
System.isArray=function isArray(object){
    return Array.isArray(object); 
}
System.getIterator=function getIterator(object){
    if( !object )return null;
    if( object[Symbol.iterator] ){
        return object[Symbol.iterator]();
    }
    var type = typeof object;
    if( type==="object" || type ==="boolean" || type ==="number" || object.length === void 0 ){
        throw new TypeError("object is not iterator");
    }
    return (function(object){ 
        return{
            index:0,
            next:function next(){
                if (this.index < object.length) {
                    return {value:object[this.index++],done:false};
                }
                return {value:undefined,done:true};
            }
        };
    })(object);
}
System.is=function is(left,right){
    if(!left || !right || typeof left !== "object")return false;
    var rId = right[System.__KEY__] ? right[System.__KEY__].id : null;
    var description =  left.constructor ? left.constructor[System.__KEY__] : null;
    if( rId === 0 && description && description.id === 1 ){
        return (function check(description,id){
            if( !description )return false;
            var imps = description.imps;
            var inherit = description.inherit;
            if( inherit === right )return true;
            if( imps ){
                for(var i=0;i<imps.length;i++){
                    if( imps[i] === right || check( imps[i][System.__KEY__], 0 ) )return true;
                }
            }
            if( inherit && inherit[ System.__KEY__ ].id === id){
                return check( inherit[System.__KEY__], 0);
            }
            return false;
        })(description,1);
    }
    return left instanceof right;
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