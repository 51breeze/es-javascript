/**
* Test a test package
*/

package;

import com.TestInterface;
import Person;
import Types;
import unit.Param;
import Request as Http;

//@Embed(Types='img.png');
//@Embed('assets/style.css');

/**
* Test a class
* @param name string
*/
//dsfsdfsdf
public class Test<U,B=string> extends Person<string> implements Iterator<number>, TestInterface {

    /**
    *  返回一个类的引用
    */
    static getClass(){
        var a = Test as class<Test<any>>;
        var buname = {a:1}
        buname.test = a;
        buname.person = Person;
        var {test} = buname;

        expect( Test ).toBe( test );
        expect( Test ).toBe( test.getClassObject() );
        expect( Test ).toBe( Reflect.call(Test, test, 'getClassObject' ) )
           
        return buname
    }

    static getClassObject():class<Test<any>>{
        var a = Test;
        var b = {
            test:a
        }
        b.person = Person;
        return b.test;
    }

    static getObject(){
        return new Test<string,number>('1','2')
    }

    /**
    * @public
    * the is static getter
    */
    static get uuName():string{
        
        return 'uuName';
    }

    /**
    * @private
    * the is class type.
    */
    private static var iiu:class<Test<any>> = Test;

    /**
    * @private
    * Automatic inference string type
    */
    private var bbss = 'bbss';

    /**
    *  property const age
    */
    private const age:int=40;
    
    /**
    * a constructor method
    */
    constructor( name:string, age?:U){
        super(name);
        super.setType('1');
        this.target;

        new Http();

        const map = new Map<string,[]>();
        map.set('name', [] );

        map.forEach( item=>{

        })
    }

     @Main
    static main(){

        (new Test('Test')).start()

    }

   
    start(){
        it(`static get uuName accessor`, ()=>{
        
            expect( Test.getClassObject().uuName ).toBe( "uuName" );
        })

        it(`'this.age' should is true`, ()=>{
            expect(this.age).toBe( 40 );
        })

         it(`'System.className' should is true`, ()=>{
            expect('Test').toBe( System.getQualifiedClassName(Test) );
        })

        it(`'this instanceof Person' should is true`, ()=>{
            expect(this instanceof Person).toBeTrue();
        })

        it(`"this is Person" should is true`, ()=>{
            expect(this is Person).toBeTrue();
        })

        it(`'this instanceof TestInterface' should is false`, ()=>{
            expect(this instanceof TestInterface).toBeFalse();
        })

        it(`'this is TestInterface' should is true`, ()=>{
            expect(this is TestInterface).toBeFalse();
        })

        it(`'Test.getClass().test' should is Test`, ()=>{
            expect( Test.getClass().test ).toBe( Test );
        })

        it(`'Test.getClass().person' should is Person`, ()=>{
            expect( Test.getClass().person ).toBe( Person );
        })

        it(`'new (Test.getClass().person)(\'\')' should is true`, ()=>{
            const o = new (Test.getClass().person)('name');
            expect( o instanceof Person ).toBeTrue();
        })

        it(`'this.bbss="666666"' should is '666666' `, ()=>{
            expect( this.bbss ).toBe( 'bbss' );
            this.bbss = "666666";
            expect( this.bbss ).toBe( '666666' );
        })

        it(`test name accessor `, ()=>{
            expect( this.name ).toBe( 'Test' );
            this.name = "test name";
            expect( this.name ).toBe( 'test name' );
        })


        it(`'var bsp = ()=>{}' should is '()=>this' `, ()=>{
            var bsp = ()=>{
                return this;
            };
            expect( bsp() ).toBe( this );
        })

        it(`once.two.three should is this or object `, ()=>{
            var bsp = (flag)=>{
                return this;
            };
            var obj = {};
            bsp = ( flag ):any=>{
                if( flag ){
                    return obj;
                }else{
                    return this;
                }
            };
            
            

            var obds = 1;
            

            const three = bsp( false );
            var once={
                two:{
                    three,
                    four:bsp
                }
            };
            
            expect( once.two.three ).toBe( this );
            expect( once.two.four(true) ).toBe( obj );
            once[ obds ]

        })

        it(`/\d+/.test( "123" ) should is true `, ()=>{
            expect( /\d+/.test( "123" ) ).toBe( true );
            expect( /^\d+/.test( " 123" ) ).toBe( false );
        });

        it("test rest params",()=>{
            const res = this.restFun(1,"s","test");
            expect(res).toEqual([1,"s","test"]);
        })

        it("test Event Dispatcher",()=>{
            const d = new EventDispatcher();
            d.addEventListener('eee',(e)=>{
                e.data = {name:'event'};
            });
            const event = new Event('eee')
            d.dispatchEvent( event );
            expect({name:'event'}).toEqual( event.data );
        })

         it("test System.getQualifiedObjectName",()=>{
           
            expect('Test').toEqual( System.getQualifiedObjectName(this) );
            expect('String').toEqual( System.getQualifiedObjectName( new String('') ) );
            expect('Test').toEqual( System.getQualifiedClassName(Test) );
            expect('[Class Test]').toEqual( Test+'' );

        });


        this.testEnumerableProperty();
        this.testComputeProperty();
        this.testLabel();
        this.testEnum();
       this.testIterator();
       this.testGenerics();
       this.testAwait();
       this.testTuple();
       this.next();
       var param = new Param();
       param.start();
    }

    private testEnumerableProperty(){
        it(`for( var name in this) should is this or object `, ()=>{
            var labels:string[] = ["name","data","target","addressName","iuuu", 'dynamic','dynamicName'];
            for( var key in this){
                expect( key ).toBe( labels[ labels.indexOf( key ) ] );
                expect( this[key] ).toBe( this[ key ] );
            }
        })
    }

    private testComputeProperty(){
        var bname = "123";
        var o = {
            [bname]:1,
            "sssss":2,
            uuu:{
                [bname]:3
            }
        };
        this['dynamicName'] = 'name';
        it(`compute property should is true `, ()=>{
            expect( o[bname] ).toBe( 1 );
            expect( this['dynamicName'] ).toBe( 'name' );
            expect( o.uuu[bname] ).toBe( 3 );
            expect( o.uuu["123"] ).toBe( 3 );
            o["uuu"][bname] = true;
             expect( o["uuu"][bname] ).toBe( true );
        });
    }

    private testLabel(){
        var num = 0;
        start:for(var i=0;i<5;i++){
                for (var j = 0; j< 5;j++){
                    if(i == 3 && j == 3){
                        break start;
                    }
                    num++;
                }
        };
        it(`label for should is loop 18`,()=>{
            expect( num ).toBe( 18 );
        });
    }

    private testEnum(){
        enum Type {
            address=5,
            name
        };

        const s:class<Types> = Types;
        const t:Type  = Type.address;
        const b:Types = Types.ADDRESS;

        it(`Type local enum should is true`,()=>{
            expect( t ).toBe( 5 );
            expect( Type.name ).toBe( 6 );
        })

        it(`Type local enum should is true`,()=>{
            expect( b ).toBe( 0 );
            expect( Types.NAME ).toBe( 1 );
        })
    }

    private testIterator(){
        var array = [];
        for( var val of this){
            array.push( val );
        }
        
        it(`impls iterator should is [0,1,2,3,4]`,()=>{
            expect(5).toBe( array.length );
            for(var i=0; i<5 ;i++){
                expect(i).toBe( array[i] );
            }
        })
        
    }

    private testGenerics(){

        const ddee = this.map();
        const dd = ddee;
        var ccc = ddee.name({name:1,age:1},"123");
        var cccww = dd.name({name:1,age:30},666);

        var types = '333';
        var bds={
            name:123,
            [types]:1
        };

        bds[ types ] = 99;

        

        it(`Generics should is true`,()=>{
           expect( typeof this.avg("test") ).toBe('string');
           expect( ccc.name.toFixed(2) ).toBe( "1.00" );
           expect( cccww.age ).toBe( 30 );
        })



        it(`class Generics`,()=>{
            let obj = this.getTestObject(true)
            var bd:Test<int,string> = obj;
            var bs = obj.getNamess(1);
            expect( bs.toFixed(2) ).toBe( "1.00" );
        })

        var bsint = this.getTestGenerics('sssss');
        var bsstring = this.getTestGenerics<string, string>("ssss", 'age');
        var bd:string | int = bsstring;

        let obj = this.getTestObject(true)
        var bsddd = obj.getNamess(1);
        var sss:(int|string)[] = obj.getClassTestGenerics(1, 1)

        var type = this;

        type B1 = {a:string};
        type B2 = {b:number};

        type T2 = B1 & B2 
        type T3 = T2 | 'label';
        type T4 = T3 | 1 | 2 | 3

        type instanceof Number;
        type is Number;
        type as Test<string,number>;

        var bb:T2 =  {a:'',b:1};
        var bc:T3 = 'label';

        type T5 = typeof bb
        type T6 = keyof T5
        type T7 = keyof typeof bb;

        var bj:T4 = 3
        var bt:T5 = {a:'sss',b:99}
        var be:T6 = 'a'
        var bf:T6 = 'b'
        var bg:T6[] = [];
        bg.push('b');

        type T8 = {
            [index:number|string]:string
        }

        var v12:T8 = {};

        var v13 = v12[1]

        var v14 = [1];

        var v15 = v14[0]

        it('keyof', ()=>{

            this['dynamic'] = '[1]';
            var v16 = this['dynamic']
            expect('[1]').toEqual( v16 );

            var bh = this.testKeyof(bt,'a');
            var fs:number = this.testKeyof(bt,'b');

            expect('sss').toEqual( bh );
            expect(99).toEqual( fs );

            var bfd = {
                name:'6699'
            }

            var fdb:string =  this.testKeyof(bfd,'name');
            expect('6699').toEqual( fdb );

            var getNamessFun =  this.testKeyof(this,'getNamess')
            expect(this.getNamess).toEqual( getNamessFun );
            var bdfs4:U = getNamessFun('sssss' as U );

        });
        
        var b9 = function(name:string, callback:(b:U)=>U ):string{
            var b = callback;
            var n = b(1 as U);
            var v = callback(1 as U );
            return '';
        }

        it('keyof', ()=>{

            function tNames():number{
                return 1
            }

            var b10 = tNames
            var b11 = b10();
            expect(1).toEqual( 1 )

            var bst9 = new Test('111', '11111' );
            expect('111').toEqual( bst9.getNamess('111') )
        })
    }

    private testKeyof<T9, K extends keyof T9>(t:T9,k:K){
        return t[k]
    }


     private getClassTestGenerics<T1>( name:T1, age?:U ):(U | T1)[]{
             var a = [age, name];
            return a;
    }

    private getTestGenerics<T,B2 extends string>( name:T, age?:B2 ):B2{
             var t =  new Test<T,B2>('name', name );
            return age;
    }

    private getTestObject( flag?:boolean ){
        const factor=()=>{
            const o = {};
            o.test = new Test('name',1);
            o.name = "test";
            return o.test;
        };
        var o = factor();
        return o;
    }

    public getNamess(s:U):U{
        return s;
    }

    private testAwait(){
         //jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
         it(`test Await`,(done)=>{
            const res = this.loadRemoteData(1);
            res.then((data)=>{
                expect( data[0] ).toEqual( ['one',1] );
                expect( data[1] ).toEqual( { bss: [ 'two', 2 ], cc: [ 'three', 3 ] } );
                expect( data[2] ).toEqual( ['three', 3 ] );
                done();
            });
        })
        it(`test for Await`,(done)=>{
            const res = this.loadRemoteData(2)
            res.then((data)=>{
                expect( data[0] ).toEqual([ '0', 0 ]);
                expect( data[1] ).toEqual([ '1', 1 ]);
                expect( data[2] ).toEqual([ '2', 2 ]);
                expect( data[3] ).toEqual([ '3', 3 ]);
                expect( data[4] ).toEqual([ '4', 4 ]);
                done();
            });
        })

        it(`test switch Await`,(done)=>{
            const res = this.loadRemoteData(3);
            res.then((data)=>{
                expect( data ).toEqual([ 'four', 4 ]);
                done();
            });
        })

        it(`test switch and for Await`,(done)=>{
            const res = this.loadRemoteData(4);
            res.then((data)=>{
                expect( data ).toEqual([ [ 'five', 5 ], [ '0', 0 ], [ '1', 1 ], [ '2', 2 ], [ '3', 3 ], [ '4', 4 ] ]);
                done();
            });
        })

        it(`test switch and for Await`,(done)=>{
            const res = this.loadRemoteData(5,1);
            res.then((data)=>{
                expect( data ).toEqual([ 'one-9999', 1 ]);
                done();
            });
        })


         it(`test switch and for Await`,(done)=>{
            const res = this.loadRemoteData(5,2);
            res.then((data)=>{
                expect( data ).toEqual([ 'two-9999', 2 ]);
                done();
            });
        })


        it(`test switch and for Await`,(done)=>{
            const res = this.loadRemoteData(6,1);
            res.then((data)=>{
                expect( data ).toEqual([ 'one-9999', 1 ]);
                done();
            });
        })


         it(`test switch and for Await`,(done)=>{
            const res = this.loadRemoteData(6,2);
            res.then((data)=>{
                expect( data ).toEqual([ 'two-9999', 2 ]);
                done();
            });
        })

        it(`test switch and for Await`,(done)=>{
            const res = this.loadRemoteData3(1);
            res.then((data)=>{
                expect( data ).toEqual([ 'one-9999', 1 ]);
                done();
            });
        }) 

        it(`test switch and for Await`,(done)=>{
            const res = this.loadRemoteData3(4);
            res.then((data)=>{
                expect( data ).toEqual('Invalid index 4');
                done();
            });
        }) 

        this.getJson().name;
    }

    getJson():any{
       return {
           name:123
       }
    }

    testTuple(){
        const data = this.method("end",9);
        it(`test tuple`,()=>{
            expect( data ).toEqual([
                [ 'a', 'b' ],
                [ 1 ],
                [ 1, 1, 'one' ],
                [ 'one', [ 'one', 1 ], 'three', 'four', [ 'end', 9 ] ]
            ]);
        });
    }

    private const len:int = 5;
    private var currentIndex:int = 0;
    public next(){
        if( !(this.currentIndex < this.len) ){
            return {value:null,done:true}
        }
        const d = {
            value:this.currentIndex++,
            done:false
        };
        return d;
    }

    public rewind(){
        this.currentIndex = 0;
    }

    public restFun(...types:[int,...string]){
        return types;
    }

    tetObject(){
        var t = new Test('1',1);
        var b = t;
        var ii={
            bb:b
        };
        return ii.bb;
    }

    loadData(){
        //@Provider(/service/api/name,get)

        //@Post('/service/api/name')

    }

    get iuuu(){
        var ii:any = this.name;
        if( 6 ){
            ii =[]
        }
        ii = true;
        return ii;
    }

    get data(){
        var b:any = [];

        if( 4 ){
            b = this.avg;
        }
        
        b = this.avg

        const dd = ()=>{
            var bs = new Promise((resolve,reject)=>{
                setTimeout(()=>{
                    resolve([])
                },100)
            });
            return bs;
        }
        return b;
    }

    fetchApi(name:string, data:int, delay:int){
        return new Promise<(string | int)[]>((resolve,reject)=>{
            setTimeout(()=>{
                resolve([name,data]);
            },delay);
        });
    }

     public async loadRemoteData2(){

          return await this.fetchApi("one", 1, 800)

     }

    public async loadRemoteData( type, index=1 ):Promise<any>{

        if( type ===5 ){
            try{
                return index==1 ? await this.fetchApi("one-9999", 1, 800) : index == 2 ?  ["two-9999", 2] : await this.fetchApi("three-9999", 3, 800)
            }catch(e){
                console.log(e)
            }
        }

        if( type ===6 ){
            return index >= 2 ? index == 2 ?  ["two-9999", 2] : await this.fetchApi("three-9999", 3, 800) : await this.fetchApi("one-9999", 1, 800)
        }

        if( type === 1 ){
            var a = await this.fetchApi("one", 1, 800);
            var bs = {
                bss: await this.fetchApi("two", 2, 500),
            }
            var c = await this.fetchApi("three", 3, 900);
            bs.cc = c;
            return [a,bs,c];
        }else{

            var list = [];
            switch( type ){
                case 3 :
                   const b = await this.fetchApi("four", 4, 300);
                   return b;
                case 4 :   
                   const bb = await this.fetchApi("five", 5, 1200);
                   list.push( bb );
            }

            for( var i=0;i<5;i++ ){
                list.push( await this.fetchApi(i+'',i,100) );
            }
            list.entries()
            return list;
        }
    }

    @override
    public method( name:string, age:int):any
    {
        super.method(name, age );
        var str:string[] = ["a","b"];
        var b:[string, [string,int] ] = ["one", ["one",1] ];
        var cc:[number] = [1];
        var x:[number,int,string] = [1,1,'one'];
        b.push( 'three' )
        b.push( 'four' )
        b.push( [name,age] )


        //var bd:number = cc.pop();
        //var tt:(number | int | string)[] = x.splice(0,5);
        //str = tt;
        return [str, cc, x, b];
    }

    @override
    public get name():string{
        return super.name;
    }

    @override
    public set name( value:string ){
        super.name = value;
    }

    @override
    avg<T extends string, B>(yy:T, bbc?:B):T{

        var ii = ()=>1;
        var bb:[string] = ['1'];

        function name<T extends TestInterface>( i:T ):T{
            var b:T = i;
            i.avg('');
            i.method('',1);
            return b;
        }

        const person = new Person<number>('');

        name<TestInterface>( person ); 
        const bbb:TestInterface = name( person ); 

        name<Person<any>>( person );

        var dd:[int, uint, ...string ] = [1,1,"2222","66666","8888"];
        var [a1,a2,a3] = dd;
        expect(1).toEqual( a1 );
        expect(1).toEqual( a2 );
        expect("2222").toEqual( a3 );
        expect([1,1,"2222","66666","8888" ]).toEqual( dd );

        expect(['1']).toEqual( bb );
        bb.push()
        expect(['1']).toEqual( bb );

        dd.push(1)
        expect([1,1,"2222","66666","8888",1]).toEqual( dd );

        return yy;

    }

    map(){
        const ddss={
            name<T extends {name:int,age:int},B>(c:T, b:B ){
                var id:B = b;
                return c;
            }
        }
        return ddss;
    }

    private address():int[]{
        const dd:int[] = [];
        const bb = {global:1,private:1};
        dd.push( 1 );
        return dd;
    }


     public async loadRemoteData3( index=1 ){

         if( index < 5 ){

            try{
                if( index == 4 ){
                    throw new Error(`Invalid index ${index}`);
                }
                return  index==1 ? await this.fetchApi("one-9999", 1, 800) : await this.fetchApi("two-9999", 2, 300) 
            }catch(e){
                //console.log(e);
                return e.message;
            }
            finally{
              
                //return false;
            }

         }else{

             return null;

         }
    
    }



}





