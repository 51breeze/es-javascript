
const _proto = Object.prototype;

function getDescriptor(obj, name){
    if( !obj )return null;
    const desc = Reflect.getOwnPropertyDescriptor(obj, name);
    if(desc)return desc;
    if(_proto === obj || obj===Object || obj===Function){
        console.log( _proto === obj  )
        return;
    }
    return getDescriptor( Object.getPrototypeOf(obj), name );
}

class Test{
    set value(v){

    }
}


const test = new Test()


console.log( getDescriptor(test, 'value') )