package web.components{

    declare class State{
        public constructor(name:string);
    }

    declare class Component{

        public constructor(props);
        public set state(vlaue:State);
        public get state():State;
        public set stateGroup( value:State[] );
        public get stateGroup():State[];
        public created();
        public updated();
        public render();
        public mounted();
        public activated();
        public deactivated();
        public destroyed();
        public beforeCreate();
        public beforeMount();
        public beforeUpdate();
        public beforeDestroy();

    }

    @SkinClass
    declare class Skin extends Component{
        public constructor(props);
    }

    declare class Metadata{
        
    }


}