<s:Skin xmlns:s="web.components"  xmlns:a="com.Skin" xmlns:cmd="@directives" 
xmlns:slot="@slots" 
xmlns:bind="@binding"
xmlns:on="@events"
>


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

        onChange(){

        }

        set value(val:string){
            this.data('value', val)
        }

        get value():string{
            return this.data<string>('value') || '9999';
        }

    
    </script>


    <style file="./assets/style.css" />

   
    <div cmd:if="name" >1</div>
    <div cmd:elseif="name">2</div>
    <div cmd:else>3</div>
    
    <div cmd:each="item of [].concat(list)" cmd:if="!name" slot:default="props">
        <div>sssssssssss</div>
        <div class="ssss">
             <div>
                <div class="" cmd:for="(itemValue,name,Index) in item ">
                    <div>{itemValue}</div>
                </div>
                <span>======</span>
            </div>
        </div>
        
    </div>

    <slot:default />
    
    <input bind:value={this.value} on:change={onChange} />

    <slot:foot props={{name:this.name}} />

    <slot:body props={{name:this.name}}>
          <div>sssssssssss</div>
    </slot:body>


</s:Skin>
