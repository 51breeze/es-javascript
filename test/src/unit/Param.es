package unit;

import unit.Jsx;

public class Param{


    start(){

        enum en {
            name1000=6,
            age=7
        };

        var b:en = en.age;
        var result = this.getList(en ,  [9,5]);
        it("test getList",()=>{
             expect(6).toBe(result);
         })
        this.ave(2.3660);

        var jsx = new Jsx();
        jsx.start();
    }

    getList<T,B>({name1000:T,age:number=9},[index:T,id=20]){

         var args = [index, id];
         it("test call",()=>{
            var b = this.call( ...args );
             expect(5).toBe(b);
         })

        return name1000;
       
    }

    call(index,id:number){

        return id

    }

    ave<T>(age:T){

        return age;

    }
}