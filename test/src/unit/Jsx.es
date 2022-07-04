package unit;

public class Jsx{

    start(){

        return <div id="ssss" xmlns:cmd="@directives" >

            <cmd:if condition="1" >
                <div>the is condition</div>
            </cmd:if>
            <cmd:else>
                <div>the is else</div>
                <div>the is else</div>
            </cmd:else>
           
            <slot:default>
                 <div>test</div>
            </slot:default>


            <div cmd:for="item in []" class="ssss">
                <div>{item}</div>
            </div>    

            <cmd:for name = "{}" item="val">
                <div>{val}</div>
            </cmd:for>

        </div>

    }
}