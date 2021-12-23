const plugins=new Map();
module.exports={
    register(name, plugin){
        plugins.set(name, plugin);
    },
    getPlugin(name){
        return plugins.get(name);
    }
}