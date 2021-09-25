var __MODULES__=[];
var key=Symbol("CLASS_KEY");
var Class={
    'key':key,
    'modules':__MODULES__,
    'require':function(id){
        return __MODULES__[id];
    },
    'creator':function(id,moduleClass,description){
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
            Object.defineProperty(moduleClass,'toString',{value:function toString(){
                var name = description.ns ? description.ns+'.'+description.name : description.name;
                var id = description.id;
                if(id === 3){
                    return '[Enum '+name+']';
                }else if(id ===2){
                    return '[Interface '+name+']';
                }else {
                    return '[Class '+name+']';
                }
            }});
        }
        Object.defineProperty(moduleClass.prototype,'constructor',{value:moduleClass});
        __MODULES__[id] = moduleClass;
    },
    'getClassByName':function(name){
        var len = __MODULES__.length;
        var index = 0;
        for(;index<len;index++){
            var classModule = __MODULES__[index];
            var description = classModule[key];
            if( description ){
                var key = description.ns ? description.ns+'.'+description.name : description.name;
                if( key === name){
                    return classModule;
                }
            }
        }
        return null;
    }
};