class TokenChunk{

    constructor(type,value,original){
        this.type = type;
        this.value = value;
        this.original = original;
        this.parent = this;
    }

    createChunk(type,value,original){
        const chunk = new TokenChunk(type,value,original);
        chunk.parent = this;
        return chunk;
    }

    make( gen ){
        gen.withString( this.value );
    }

}