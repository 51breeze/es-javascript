const ClassBuilder = require("../core/ClassBuilder");
module.exports = function(ctx,stack,type){
    return ClassBuilder.createClassNode(stack,ctx,type);
}