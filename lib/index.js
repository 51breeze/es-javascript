import path from 'path'
import Plugin from "@easescript/transform/lib/core/Plugin";
import {getOptions} from "@easescript/transform/lib/index";
import pkg from "../package.json";
import {createPolyfillModule} from '@easescript/transform/lib/core/Polyfill';

let initialized = false;
function plugin(options={}){
    if(!initialized){
        initialized = true;
        createPolyfillModule(path.resolve(__dirname,'./polyfills'))
        createPolyfillModule(path.resolve("node_modules/@easescript/transform/lib/polyfills"))
    }
    return new Plugin(
        pkg.esconfig.scope,
        pkg.version,
        getOptions(options)
    )
}
export default plugin;