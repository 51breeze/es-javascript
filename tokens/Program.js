const path = require('path');
const ClassBuilder = require('../core/ClassBuilder')
function createCJSExports(exports, node){
    const dataset = [];
    const insertImports = [];
    exports.forEach( item=>{
        const obj = node.createToken(item);
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
                    const refs = obj.checkRefsName( path.parse( obj.source.value ).name, true, 31, null, false);
                    insertImports.push( node.createImportDeclaration(obj.source, [node.createImportSpecifierNode( refs, refs )], obj.stack) );
                    obj.specifiers.forEach( specifier=>{
                        dataset.push(
                            node.createPropertyNode(
                                specifier.exported.value,  
                                node.createMemberNode([
                                    node.createIdentifierNode(refs,null,true), 
                                    specifier.local
                                ])
                            )
                        );
                    });
                }else{
                    obj.specifiers.forEach( specifier=>{
                        dataset.push(
                            node.createPropertyNode(
                                specifier.exported.value,
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
            const refs = obj.checkRefsName(obj.exported.value,true,31, null, false);
            insertImports.push( node.createImportDeclaration(obj.source, [ node.createImportSpecifierNode( refs, '*', true ) ], obj.stack) );
            dataset.push(
                node.createPropertyNode(
                    obj.exported.value,  
                    node.createIdentifierNode(refs,null,true)
                )
            );
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

    // const syntaxAnnotation = stack.annotations && stack.annotations.find( annotation=>annotation.name.toLowerCase() ==='syntax');
    // if( syntaxAnnotation ){
    //     const args = syntaxAnnotation.getArguments();
    //     if( args[0] ){
    //         if( ctx.builder.isSyntax( args[0].value ) ){
    //             ctx.compilation.setClientPolicy();
    //         }else{
    //             return;
    //         }
    //     }
    // }

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
            const desc = item.description();
            if( !desc || desc !== stack.compilation.mainModule){
                node.imports.push( node.createToken(item) );
            }
        });
    }

    if( stack.externals.length > 0 ){
        // const parenthes = ctx.createNode('ParenthesizedExpression');
        // parenthes.expression = parenthes.createCalleeNode(parenthes.createFunctionNode((ctx)=>{
        // }));
        // const external = ctx.createStatementNode( parenthes );
        // external.comment = '/*externals code*/';
        //node.body.push( external );
        const dependencies = stack.compilation.modules.size > 0 && stack.compilation.mainModule && stack.compilation.mainModule.isClass ? 
                                new Set(node.builder.moduleDependencies.get(stack.compilation)) : null;
        const importedLocalKeyMap = {};
        stack.externals.forEach( item=>{
            if( item.isImportDeclaration ){
                const importNode = node.createToken(item);
                if(importNode){
                    node.imports.push( importNode );
                    if( importNode.type==='ImportDeclaration'){
                        importNode.specifiers.forEach( sepc=>{
                            importedLocalKeyMap[sepc.local.value] = item.source.value
                        })
                    }
                }
            }else{
                const obj = node.createToken(item);
                if( obj ){
                    externals.push( obj );
                }
            }
        });

        if(dependencies){

            const newDeps = node.builder.moduleDependencies.get(stack.compilation);
            stack.compilation.modules.forEach( module=>{
                const items = node.builder.geImportReferences(module);
                if( items ){
                    items.forEach( item=>{
                        item.specifiers.forEach( sepc=>{
                            importedLocalKeyMap[sepc.local.value] = item.source.value
                        })
                    })
                }
            });

            if( newDeps.size> 0 ){

                const findClassDeclaration=(body)=>{
                    if(!Array.isArray(node.body))return;
                    body.forEach( item=>{
                        if(!item)return;
                        if( item.type === 'PackageDeclaration' ){
                            findClassDeclaration(item.body);
                        }else if(item.type==='ClassDeclaration'){
                            findClassDeclaration(item.body)
                        }else if(item.type==="ImportDeclaration"){
                            item.specifiers.forEach( sepc=>{
                                importedLocalKeyMap[sepc.local.value] = item.source.value;
                            })
                        }
                    });
                }

                findClassDeclaration(node.body);
                newDeps.forEach( depModule=>{
                    if(!dependencies.has(depModule)){
                        const name = node.builder.getModuleReferenceName(depModule, stack.compilation);
                        if(!importedLocalKeyMap[name] && node.builder.isActiveForModule(depModule) && node.builder.isPluginInContext(depModule)){
                            const source = node.builder.getModuleImportSource(depModule, stack.compilation);
                            node.builder.addAsset(stack.compilation, source, 'externals', depModule);
                            node.imports.push( node.createImportDeclaration(source, [[name]]) );
                        }
                    }
                })
            }
        }
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

    if( stack.compilation.modules.size ===0 ){
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