(function(definedModules){

    /**
     * 已加载的模块
     */
    var installedModules = {};
    var key=Symbol("CLASS_KEY");

    /**
     * 生成类的描述信息
     * @param {*} moduleClass 
     * @param {*} description 
     */
     function creator(moduleClass,description){
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
    }
    
    /**
     * 加载并初始化模块
     * @param string 
     */
    function require( identifier ){
        if( installedModules[identifier] ){
            return installedModules[identifier].exports;
        }
    
        if( !definedModules.hasOwnProperty(identifier) ){
             throw new ReferenceError("Require module '"+identifier +"' is not exists.");
        }
    
        var module = installedModules[identifier] = {
            'id': identifier,
            'creator':creator,
            'require':require,
            'exports': {},
            'key':key,
        };
    
        definedModules[identifier].call(module, module, require);
        return module.exports;
    }

    /**
     * 判断是否有定义此标识符的模块
     */
    require.has=function has( identifier ){
        return definedModules.hasOwnProperty(identifier);
    }

    /**
     * 加载入口文件
     */
    [CODE[MAIN_ENTER]]
    
}([CODE[MODULES]]));