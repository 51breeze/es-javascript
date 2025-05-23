import {getOptions, Plugin} from "@easescript/transform/lib/index";
import pkg from "../package.json";
function plugin(options={}){
    return new Plugin(
        pkg.esconfig.scope,
        pkg.version,
        getOptions(options)
    )
}
export {getOptions, Plugin};
export default plugin;