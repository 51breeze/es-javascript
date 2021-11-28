<s:Skin xmlns:s="com"  xmlns:a="com.Skin" xmlns:cmd="@directive">

    <script>

        import web.components.State;

        private var test:string = 'sss';

        @override
        mounted(){

        }

        private var _name:string = 'Yejun';

        set name(value:string){
            this._name = value;
        }

        get name():string{
            return this._name;
        }

        get list():string[]{
            return this._list || ['ssss', 'sssss'];
        }

        private var _list:string[] = null;
        set list( value:string[] ){
           this._list = value; 
        }

    
    </script>


    <style file="./assets/style.css" />

   
    <div cmd:if="name" >1</div>
    <div cmd:elseif="name">2</div>
    <div cmd:else>3</div>
    
    <div cmd:foreach="list as item" cmd:if="!name">
        <div>sssssssssss</div>
        <div class="ssss">
             <div>
                <div class="" cmd:for="item as itemValue,,Index">
                    <div>{itemValue}</div>
                </div>
                <span>======</span>
            </div>
        </div>
    </div>

    <div class="">
       <div>item</div>
    </div>


</s:Skin>
