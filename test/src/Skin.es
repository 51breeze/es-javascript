<s:Skin xmlns:s="web.components"  xmlns:a="web.components.Skin" name="ssss"  xmlns:cmd="@directive">

    <script>

        import web.components.State;


        private var test:string = 'sss';

        @override
        mounted(){

        }

        set name(value:string){

        }

        get name():string{

            return 'name'

        }

        get list():string[]{
            return ['ssss', 'sssss'];
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
