const Stack = require("../core/Stack");
class AnnotationExpression extends Stack{
    emitter(){ 
        const target={};
        switch( this.stack.name ){
            case "Router" :
            case "Output" :
                this.body.map( (item,index)=>{
                    if(item.isAssignmentPattern){
                        const key = item.left.value();
                        target[key]=item.right.value();  
                    }else{
                        target[index] = item.value();
                    }
                });
                break;
        }
        return null;
    }
}

module.exports = AnnotationExpression;