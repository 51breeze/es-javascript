
const Assets = require('./Assets')
const {parseResource} = require('./Utils')

const Records = new Map();
class BuildModule{

    static getModuleByResourcePath(resourcePath){
        return Records.get(resourcePath);
    }

    static create(resourceId, mainFlag=false){
        const {resourcePath, query} = parseResource(resourceId);
        let module = Records.get(resourcePath);
        if( !module ){
            module = new BuildModule(resourceId, resourcePath, query);
            Records.set(resourcePath, module);
        }
        if(query.id && !mainFlag){
            const main = module;
            module = main.getModule(query.id);
            if(!module){
                module = new BuildModule(resourceId, resourcePath, query);
                main.setModule(query.id, module);
            }
        }
        return module;
    }

    #attrs = {};
    #resourcePath = null;
    #resourceId = null;
    #assets = new Set();
    #modules = new Map();
    #content = null;
    #isEntry = false;
    #isDynamicImporter = false;
    #sourceMap = null;
    #dependencies = new Set();

    constructor(resourceId, resourcePath, query){
        this.#resourceId = resourceId;
        this.#resourcePath = resourcePath;
        this.#attrs = query;
    }

    clear(){
        if( this.#content !== null ){
            this.#assets.clear();
            this.#modules.clear();
            this.#content = null;
            this.#sourceMap = null;
            this.#dependencies.clear();
        }
    }

    setModule(id, module){
        this.#modules.set(id,module);
    }

    getModule(id){
        if(!id)return this;
        return this.#modules.get(id) || null;
    }

    hasModule(id){
        return  this.#modules.has(id)
    }

    get isEntry(){
        return this.#isEntry
    }

    get isDynamicImporter(){
        return this.#isDynamicImporter;
    }

    get resourcePath(){
        return this.#resourcePath
    }

    get resourceId(){
        return this.#resourceId;
    }

    set attrs( attrs={}){
        this.#attrs = attrs;
    }

    get attrs(){
        return this.#attrs; 
    }

    set content(code){
        this.#content = code;
    }

    get content(){
        return this.#content;
    }

    set sourceMap(value){
        this.#sourceMap = value;
    }

    get sourceMap(){
        return this.#sourceMap;
    }

    get sourceMapJSON(){
       const sourceMap = this.#sourceMap;
       if(!sourceMap)return '';
       return JSON.stringify(sourceMap);
    }

    addDepend(module){
        this.#dependencies.add(module)
    }

    get dependencies(){
        return this.#dependencies;
    }

    addAsset(asset){
        if(Assets.is(asset)){
            this.#assets.add(asset);
        }else{
            throw new Error(`The 'asset' arguments invalid on BuildModule.addAsset.`)
        }
    }

    getAsset(type, index=0, resourcePath=null){
        resourcePath = resourcePath || this.resourcePath;
        return Assets.getAsset(this.resourcePath, type, index);
    }
}

module.exports = BuildModule;