
const Assets = require('./Assets')
const {parseResource} = require('./Utils')

const Records = new Map();
class BuildModule{

    static getModuleByResourcePath(file){
        return Records.get(file);
    }

    static create(resourceId, type='normal'){
        const {resourcePath, query} = parseResource(resourceId);
        let module = Records.get(resourcePath);
        if( !module ){
            module = new BuildModule(resourceId, type);
            Records.set(resourcePath, module);
        }
        module.#resourceId = resourceId;
        module.#resourcePath = resourcePath;
        module.#attrs = query;
        module.#type = type;
        return module;
    }

    #attrs = {};
    #type = 'normal';
    #resourcePath = null;
    #resourceId = null;
    #assets = new Set();
    #modules = {};
    #content = null;
    #isEntry = false;
    #isDynamicImporter = false;
    #sourceMap = null;
    #dependencies = new Set();

    clear(){
        if( this.#content !== null ){
            this.#assets.clear();
            this.#modules = {};
            this.#content = null;
            this.#sourceMap = null;
            this.#dependencies.clear();
        }
    }

    setModule(id, module){
        this.#modules[id] = module;
    }

    getModule(id){
        if(!id)return this;
        return this.#modules[id] || null;
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

    get type(){
        return this.#type;
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