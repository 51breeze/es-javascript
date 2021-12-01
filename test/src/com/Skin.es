package com;
import web.components.Component;
import com.State;
import PersonSkin;

class Skin extends Component{

    public set state(vlaue:State){

    }

    public get state():State{
        return new State('name');
    }

    public set stateGroup( value:State[] ){

    }

    public get stateGroup():State[]{
         return [ this.state  ];
    }

    public set states(vlaue:State[]){

    }

    @override
    public render(c){
        return <PersonSkin xmlns:slot="@slots">
                    <slot:foot scope>
                            ssssssssssssssss {scope.props}
                    </slot:foot>
                     <slot:default>
                            =========default===========
                    </slot:default>
            </PersonSkin>
    }
}