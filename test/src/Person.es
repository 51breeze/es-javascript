package;

import com.TestInterface;

public class Person<T> extends Object implements TestInterface
{

    public var addressName:string = `the Person properyt "addressName"`;

    private var _name:string = '';

    private var _type:T = null;

    constructor( name:string ){
        super();
        this._name = name;
        // document.body.onclick=(e)=>{

        //     return 1;

        // }
    }

    get target(){
        return this;
    }

    public setType(a:T):T{
        this._type = a;
        return a;
    }

    public method( name:string, age:int):any
    {
        var str:string[] = ["a","1"];
        var b:[string, [string,int] ] = ["", ["1",1] ];

        var cc:[number] = [1];
        var x:[number,int,string,...object] = [1,1,'2222',{}];

        b.push( '1' )
        b.push( ['1',1] )

       var c:int = -1968;
       var bs:float = 22.366
       var bssd:number = -22.366
        this.target.address();
        return "sssss";
    }


    public get name():string{
        return this._name;
    }

    public set name(val:string){
        this._name = val;
    }

    avg<T extends string,B>(a:T,b?:B):T{
        return a;
    }

    private address(){
        
    }

    protected addressNamesss(){

    }

    


}

    

