package{

    public enum Types {
        ADDRESS,
        NAME,

        disable='禁用'
        enable='启用'

        Ser1 = 'A'
        Ser2
        Ser3

        label(){
            switch(this.value){
                case ADDRESS :
                    return '地址'
                case NAME :
                    return '名称'
            }
            return this.name
        }

    }

}