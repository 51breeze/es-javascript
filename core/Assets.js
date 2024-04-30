const {parseResource} = require('./Utils')
const fs = require('fs');
const AssetsKey = Symbol('assets');
const Records = new Map();
class Assets{

    static getKey(resourcePath, type, index){
        return resourcePath+':'+type+':'+index;
    }

    static getAsset(resourcePath, type, index=0){
        return Records.get(Assets.getKey(resourcePath, type, index)) || null;
    }

    static is(obj){
        return obj && obj[AssetsKey] === true;
    }

    static create(type, resourceId, content=null, isFile=null){
        const {resourcePath, query} = parseResource(resourceId);
        let asset = Records.get(resourcePath);
        let index = query.index||0;
        if( !asset ){
            asset = new Assets();
            asset[AssetsKey] = true;
            Records.set(Assets.getKey(resourcePath, type, index), asset);
        }

        if(isFile===null){
            isFile = !content;
        }else{
            isFile = Boolean(isFile);
        }

        asset.#resourceId = resourceId;
        asset.#resourcePath = resourcePath;
        asset.#attrs = query;
        asset.#type = type;
        asset.#isFile = isFile;
        asset.#content = content;
        asset.#index = index;
        return asset;
    }

    #attrs = {};
    #type = null;
    #resourceId = '';
    #resourcePath = '';
    #isFile = false;
    #index = null;
    #content = null;
    #sourceMap = null;

    clear(){
        this.#sourceMap = null;
    }

    get key(){
        return Assets.getKey(this.#resourcePath,this.#type,this.#index);
    }

    get type(){
        return this.#type;
    }

    get resourceId(){
        return this.#resourceId;
    }

    get resourcePath(){
        return this.#resourcePath;
    }

    get index(){
        return this.#index;
    }

    get isFile(){
        return this.#isFile
    }

    get attrs(){
        return this.#attrs;
    }

    set content(code){
        this.#content = code;
        if(code != null){
            this.#isFile = false;
        }
    }

    get content(){
        if(this.#content === null){
            if(!this.resourceId || !fs.existsSync(this.resourceId)){
                throw new Error(`The '${this.resourceId}' file is not exists`)
            }else{
                this.#content = fs.readFileSync(this.resourceId, {encoding:"utf8"})
            }
        }
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
}


module.exports = Assets;