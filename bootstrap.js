(function(definedModules){

    /**
     * 已加载的模块
     */
    var installedModules = {};

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
            'require':require,
            'done':false,
            'exports':{},
        };
    
        definedModules[identifier].call(module, module, module.exports);
        module.done = true;
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