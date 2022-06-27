const Token = require("../core/Token");
class ImportDeclaration extends Token{
  
   createChildren(stack){
      const specifiers = Array.isArray( stack.specifiers ) ? stack.specifiers : [ stack.specifiers ];
      this.specifiers = specifiers.map( item=>this.createToken(item) );
   }

   make( gen ){
      if( this.stack ){
         const classModule = this.stack.getModuleById( this.stack.specifiers.value() );
         if( this.isActiveForModule(classModule) ){
            const name = this.stack.alias ? this.stack.alias.value() : classModule.id;
            const source = this.builder.getModuleImportSource( classModule, this.compilation.file );
            gen.newLine();
            gen.withString(`import ${name} from "${source}"`);
            gen.withSemicolon();
         }
      }else{
         const normal = this.specifiers.filter( item=>item.type ==='ImportDefaultSpecifier' || item.type === 'ImportNamespaceSpecifier' );
         const specifier = this.specifiers.filter( item=>item.type ==='ImportSpecifier' );
         gen.newLine();
         gen.withString(`import`);
         gen.withSpace();
         if( normal.length > 0 ){
            gen.withSequence( normal );
         }
         if( specifier.length > 0 ){
            if( normal.length > 0 ){
               gen.withComma();
            }
            gen.withBraceL();
            gen.withSequence( specifier );
            gen.withBraceR();
         }
         gen.withSemicolon();
      }
   }

}
module.exports = ImportDeclaration;