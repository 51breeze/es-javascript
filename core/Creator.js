var __MODULES__=[];
var key=Symbol("CLASS_KEY");
module.exports={
    'key':key,
    'get':function(id){
        return __MODULES__[id];
    },
    'set':function(id,moduleClass,description){
        if( description ){
            if( description.inherit ){
                Object.defineProperty(moduleClass,'prototype',{value:Object.create(description.inherit.prototype)});
            }
            if( description.methods ){
                Object.defineProperties(moduleClass,description.methods);
            }
            if( description.members ){
                Object.defineProperties(moduleClass.prototype,description.members);
            }
            Object.defineProperty(moduleClass,key,{value:description});
            Object.defineProperty(moduleClass,'name',{value:description.name});
        }
        Object.defineProperty(moduleClass.prototype,'constructor',{value:moduleClass});
        __MODULES__[id] = moduleClass;
    }
};