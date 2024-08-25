const path = require('path');
const ClassBuilder = require('../core/ClassBuilder')
function createCJSExports(exports, node){
    const dataset = [];
    const insertImports = [];
    exports.forEach( item=>{
        const obj = node.createToken(item);
        if( !obj ){
            return;
        }
        if( obj.type === 'ExportNamedDeclaration' ){
            if( obj.declaration ){
                if( obj.declaration.type ==='FunctionDeclaration' ){
                    dataset.push( 
                        node.createPropertyNode(
                            obj.declaration.key.value, 
                            obj.declaration
                        )
                    );
                }else if( obj.declaration.type ==='Identifier' ){
                    dataset.push(
                        node.createPropertyNode(
                            obj.declaration.value, 
                            obj.declaration
                        )
                    );
                }else if( obj.declaration.type ==='ClassDeclaration' ){
                    dataset.push( 
                        node.createPropertyNode(
                            obj.declaration.module.id, 
                            node.createIdentifierNode(
                                node.getModuleReferenceName(
                                    obj.declaration.module
                                )
                            )
                        )
                    );
                }else if(obj.declaration.type ==='VariableDeclaration'){
                    obj.declaration.declarations.forEach( declare=>{
                        if( declare.init )dataset.push( node.createPropertyNode(declare.id.value,  declare.init) ); 
                    });
                }
            }else if( obj.specifiers && obj.specifiers.length>0 ){
                if( obj.source ){
                    const specifiers = obj.specifiers.map(spec=>{
                        const local = spec.exported.value;
                        const imported = spec.local.value;
                        return node.createImportSpecifierNode(local, imported);
                    });
                    insertImports.push( node.createImportDeclaration(obj.source, specifiers, obj.stack) );
                    obj.specifiers.forEach( specifier=>{
                        dataset.push(
                            node.createPropertyNode(
                                specifier.exported,  
                                specifier.exported
                            )
                        );
                    });
                }else{
                    obj.specifiers.forEach( specifier=>{
                        dataset.push(
                            node.createPropertyNode(
                                specifier.exported,
                                specifier.local
                            )
                        );
                    });
                }
            }
        }
        else if(obj.type === 'ExportDefaultDeclaration'){
            if( obj.declaration.type ==='ClassDeclaration' ){
                dataset.push(
                    node.createPropertyNode(
                        'default',
                        node.createIdentifierNode( 
                            node.getModuleReferenceName( obj.declaration.module ) 
                        )
                    )
                );
            }else{
                dataset.push(node.createPropertyNode('default', obj.declaration));
            }
        }
        else if( obj.type === 'ExportAllDeclaration' ){
            if(obj.source){
                if(obj.exported){
                    insertImports.push( node.createImportDeclaration(obj.source, [ node.createImportSpecifierNode(obj.exported.value, '*', true ) ], obj.stack) );
                    dataset.push(
                        node.createPropertyNode(
                            obj.exported,  
                            obj.exported
                        )
                    );
                }else{
                    const local = '__'+path.parse(obj.source.value).name.replace(/[\W]+/g,'_')
                    const refs = obj.checkRefsName(local,true,31, null, false);
                    insertImports.push( node.createImportDeclaration(obj.source, [ node.createImportSpecifierNode(refs, '*', true ) ], obj.stack) );
                    const spread = node.createNode('SpreadElement')
                    spread.argument = spread.createIdentifierNode(refs)
                    dataset.unshift(spread);
                }
            }
        }
    });
    return [
        node.createStatementNode(
            node.createAssignmentNode(
                node.createMemberNode([
                    node.createIdentifierNode('module'),
                    node.createIdentifierNode('exports')
                ]), 
                dataset.length ===1 && dataset[0].key.value ==='default' ? 
                dataset[0].init : node.createObjectNode( dataset )
            )
        ),
        insertImports
    ];
}


module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    const externals = [];
    node.isProgram = true;
    node.body = [];
    node.afterBody = [];
    node.imports = [];

    const rawBuilders = [];
    const rawJsx = ctx.builder.isRawJsx();

    stack.body.forEach( item=>{
        if( stack.isJSXProgram || item.isClassDeclaration || item.isDeclaratorDeclaration || item.isEnumDeclaration || item.isInterfaceDeclaration || item.isPackageDeclaration ){
            const child = node.createToken(item);
            if( rawJsx ){
                if( item.isPackageDeclaration && child ){
                    rawBuilders.push( ...child.body.filter( item=>item && item.isRawBuilder ) )
                }else if(child && child.isRawBuilder){
                    rawBuilders.push( child );
                }
            }
            node.body.push(child);
        }
    });

    if( stack.imports && stack.imports.length > 0 ){
        stack.imports.forEach( item=>{
            if(item.isImportDeclaration && item.source.isLiteral){
                const desc = item.description();
                if(!desc || desc !== stack.compilation.mainModule){
                    const importNode =node.createToken(item)
                    if(importNode){
                        node.imports.push( importNode );
                    }
                }
            }
        });
    }

    if( stack.externals.length > 0 ){
        stack.externals.forEach( item=>{
            if( item.isImportDeclaration ){
                
            }else{
                const obj = node.createToken(item);
                if( obj ){
                    externals.push( obj );
                }
            }
        });
    }

    if( stack.exports.length > 0 ){
        if( node.builder.plugin.options.module==='cjs' ){
           const [exportNode,exportImports] = createCJSExports(stack.exports , node);
           node.imports.push( ...exportImports )
           node.afterBody.push(exportNode);
        }else{
            stack.exports.forEach( item=>{
                const obj = node.createToken(item);
                if(obj){
                    node.afterBody.push(obj)
                }
            });
        }
    }

    if(stack.compilation.modules.size > 0){
        const newDeps = node.builder.moduleDependencies.get(stack.compilation);
        if(newDeps){
            stack.compilation.modules.forEach( module=>{
                const deps = node.builder.moduleDependencies.get(module);
                if(deps){
                    deps.forEach(dep=>newDeps.delete(dep))
                }
            });
            if(newDeps.size> 0){
                newDeps.forEach( depModule=>{
                    const name = node.builder.getModuleReferenceName(depModule, stack.compilation);
                    if(node.builder.isActiveForModule(depModule) && node.builder.isPluginInContext(depModule)){
                        const source = node.builder.getModuleImportSource(depModule, stack.compilation);
                        node.builder.addAsset(stack.compilation, source, 'externals', depModule);
                        node.imports.push( node.createImportDeclaration(source, [[name]]) );
                    }
                })
            }
        }
    }else{
        const classNode = new ClassBuilder(stack, node);
        classNode.createModuleAssets(stack.compilation);
        node.imports.push( ...classNode.createDependencies(stack.compilation));
        const references = node.builder.geImportReferences(stack.compilation);
        if( references ){
            references.forEach( item=>{
                node.imports.push( item );
            });
        }
    }

    if( rawBuilders.length > 0 ){
        rawBuilders.forEach(rawBuilder=>{
            let script = rawBuilder.body.find( node=>node && node.type ==='JSXElement' && node.openingElement.name.value ==='script');
            if( !script ){
                script = rawBuilder.createTemplateNode();
            }
            script.children.unshift( ...node.imports );
            script.children.push( ...externals );
            script.children.push( ...node.afterBody );
        });

    }else{
        node.body.unshift( ...node.imports );
        node.body.push( ...externals );
        node.body.push( ...node.afterBody );
    }
    node.emit('createComplated', node.body);

    delete node.imports;
    delete node.afterBody;
    return node;
}