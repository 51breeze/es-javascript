const Class = require("./Class.js");
const Enumeration = require("./Enumeration.js");
function Types(){
    Enumeration.apply(this,arguments);
}
Class.creator(Types,{
    m:2049,
    name:"Types",
    inherit:Enumeration,
    methods:{
        ADDRESS:{
            m:3328,
            value:0
        },
        NAME:{
            m:3328,
            value:1
        },
        disable:{
            m:3328,
            value:'禁用'
        },
        enable:{
            m:3328,
            value:'启用'
        },
        Ser1:{
            m:3328,
            value:'A'
        },
        Ser2:{
            m:3328,
            value:"B"
        },
        Ser3:{
            m:3328,
            value:"C"
        }
    },
    members:{
        label:{
            m:2112,
            value:function label(){
                switch(this.value){
                    case Types.ADDRESS :
                        return '地址';
                    case Types.NAME :
                        return '名称';
                }
                return this.name;
            }
        }
    }
});
module.exports=Types;