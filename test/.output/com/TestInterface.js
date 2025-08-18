const Class = require("./../Class.js");
function TestInterface(){}
Class.creator(TestInterface,{
    m:2050,
    ns:"com",
    name:"TestInterface",
    dynamic:true,
    members:{
        name:{
            m:2176,
            get:true,
            set:true
        },
        avg:{
            m:2112
        },
        method:{
            m:2112
        }
    }
});
module.exports=TestInterface;