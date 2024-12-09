import Plugin from "@easescript/transform/lib/core/Plugin";
import {getOptions} from "@easescript/transform/lib/index";
import pkg from "../package.json";
function plugin(options={}){
    return new Plugin(
        pkg.esconfig.scope,
        pkg.version,
        getOptions(options)
    )
}
export default plugin;