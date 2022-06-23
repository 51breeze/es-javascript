module.exports = function(stack){

     const desc = stack.description();
     const module = this.module;
     const builder = this.getBuilder();
     var token = this.stack.value();
     if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) ){
          const getThisName = ()=>{
               let parent = this.getParentByType('ArrowFunctionExpression');
               if( parent ){
                    parent = parent.getParentByType( item=>item._type === "FunctionExpression" || item._type === "Program" );
                    if( parent ){
                         parent.getData()
                         this.createToken('Identifier','_this')
                         parent.body.addChildAt( );
                         const name = builder.generatorVarName(stack,"_this",true);
                         stack.dispatcher("insertThisName", name );
                         return name;
                    }
               }
               return 'this';
          }
          const ownerModule = desc.module;
          const isStatic = !!(desc.static || ownerModule.static);
          const target = isStatic ? ownerModule.id : getThisName();
          token = `${target}.${token}`;
     }

     if( module && this.compiler.callUtils("isClassType", desc) ){
          builder.addDepend( desc );
          token = builder.getModuleReferenceName(desc, module);
     }

     this.setValue( token );
};