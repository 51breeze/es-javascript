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

   


    <div cmd:if="name">1</div>
    <div cmd:elseif="name">2</div>
    <div cmd:else>3</div>
    
    <div cmd:foreach="list as item" cmd:if="!name">
         <div class="ssss">
             <div>
                <div class="">
                    <div>{item}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="">
       <div>666</div>
    </div>


</s:Skin>
