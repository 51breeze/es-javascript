declare interface Storage{
    const length:number;
    setItem(name:string,value:string):void;
    getItem(name:string):string;
    removeItem(name:string):void;
    key(index:number):string;
    clear():void;
}

declare const sessionStorage:Storage;
declare const localStorage:Storage;
declare System{
    static const env:EnvInterface;
    static forMap<T=any>(target, callback:(item:any, key:string|number)=>T):T[]
    static registerHook(type:'httpRequestCreated', processer:(value?:net.Http)=>void, priority:number=0):void;
    static registerHook(type:'httpRequestSendBefore', processer:(value?:net.Http,config?:net.HttpConfig)=>void, priority:number=0):void;
    static registerOnceHook(type:string,processer:(...args)=>void, priority:number=0):void;
    static registerOnceHook(type:'httpRequestCreated', processer:(value?:net.Http)=>void, priority:number=0):void;
    static registerOnceHook(type:'httpRequestSendBefore', processer:(value?:net.Http,config?:net.HttpConfig)=>void, priority:number=0):void;
    static dispatchHook(type:string,...args):any;
    static removeHook(type:string,processer?:Function):boolean;
    static hasRegisterHook(type:string, processer?:Function):boolean;
    static setImmediate(callback:(...args)=>void, ...args):number;
    static clearImmediate(id:number):void;
}

declare interface EnvInterface{
    isClient():boolean;
    platform(name:string,version?):boolean;
    version(value, operator?:string):boolean;
    isMobile():boolean;
    referrer():string;
}

declare class Proxy{
    static revocable<T extends object>(target: T, handler: ProxyHandler<T>): { proxy: T, revoke: () => void};
    constructor<T extends object>(target:T, handler:ProxyHandler<T>):T;
}

declare interface ProxyHandler<T extends object> {
    apply?(target: T, thisArg: any, argArray: any[]): any;
    construct?(target: T, argArray: any[], newTarget: Function): object;
    defineProperty?(target: T, p: string, attributes: PropertyDescriptor): boolean;
    deleteProperty?(target: T, p: string): boolean;
    get?(target: T, p: string, receiver: any): any;
    getOwnPropertyDescriptor?(target: T, p: string): PropertyDescriptor;
    getPrototypeOf?(target: T): object | null;
    has?(target: T, p: string): boolean;
    isExtensible?(target: T): boolean;
    ownKeys?(target: T): ArrayLike<string>;
    preventExtensions?(target: T): boolean;
    set?(target: T, p: string, value: any, receiver: any): boolean;
    setPrototypeOf?(target: T, v: object | null): boolean;
}

declare interface PropertyDescriptor {
    configurable?: boolean;
    enumerable?: boolean;
    value?: any;
    writable?: boolean;
    get?(): any;
    set?(v: any): void;
}

declare interface IteratorYieldResult<TYield> {
    done?: false;
    value: TYield;
}

declare type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>;

declare interface SymbolConstructor {
    /**
    * Returns a new unique Symbol value.
    * @param  description Description of the new Symbol object.
    */
    (description?: string | number): symbol;

    /**
    * Returns a Symbol object from the global symbol registry matching the given key if found.
    * Otherwise, returns a new symbol with this key.
    * @param key key to search for.
    */
    for(key: string): symbol;

    /**
    * Returns a key from the global symbol registry matching the given Symbol if found.
    * Otherwise, returns a undefined.
    * @param sym Symbol to find the key for.
    */
    keyFor(sym: symbol): string | undefined;

    /**
    * A method that returns the default async iterator for an object. Called by the semantics of
    * the for-await-of statement.
    */
    readonly asyncIterator: unique symbol;

    /**
    * A method that determines if a constructor object recognizes an object as one of the
    * constructor’s instances. Called by the semantics of the instanceof operator.
    */
    readonly hasInstance: unique symbol;

    /**
    * A Boolean value that if true indicates that an object should flatten to its array elements
    * by Array.prototype.concat.
    */
    readonly isConcatSpreadable: unique symbol;

    /**
    * A regular expression method that matches the regular expression against a string. Called
    * by the String.prototype.match method.
    */
    readonly match: unique symbol;

    /**
    * A regular expression method that replaces matched substrings of a string. Called by the
    * String.prototype.replace method.
    */
    readonly replace: unique symbol;

    /**
    * A regular expression method that returns the index within a string that matches the
    * regular expression. Called by the String.prototype.search method.
    */
    readonly search: unique symbol;

    /**
    * A function valued property that is the constructor function that is used to create
    * derived objects.
    */
    readonly species: unique symbol;

    /**
    * A regular expression method that splits a string at the indices that match the regular
    * expression. Called by the String.prototype.split method.
    */
    readonly split: unique symbol;

    /**
    * A method that converts an object to a corresponding primitive value.
    * Called by the ToPrimitive abstract operation.
    */
    readonly toPrimitive: unique symbol;

    /**
    * A String value that is used in the creation of the default string description of an object.
    * Called by the built-in method Object.prototype.toString.
    */
    readonly toStringTag: unique symbol;

    /**
    * An Object whose own property names are property names that are excluded from the 'with'
    * environment bindings of the associated objects.
    */
    readonly unscopables: unique symbol;

    readonly iterator: unique symbol;
}

declare interface Symbol {
    /** Returns a string representation of an object. */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): symbol;

    /**
    * Converts a Symbol object to a symbol.
    */
    [Symbol.toPrimitive](hint: string): symbol;

    readonly [Symbol.toStringTag]: string;
}

declare type bigint = Number;
declare type symbol = Symbol;
declare var Symbol: SymbolConstructor;

declare interface GeneratorFunction {
    readonly [Symbol.toStringTag]: string;
}

declare class Array {
    /**
    * Returns an object whose properties have the value 'true'
    * when they will be absent when used in a 'with' statement.
    */
    [Symbol.unscopables](): {
        copyWithin: boolean;
        entries: boolean;
        fill: boolean;
        find: boolean;
        findIndex: boolean;
        keys: boolean;
        values: boolean;
    };
}

declare class Date {
    /**
    * Converts a Date object to a string.
    */
    [Symbol.toPrimitive](hint: "default"): string;
    /**
    * Converts a Date object to a string.
    */
    [Symbol.toPrimitive](hint: "string"): string;
    /**
    * Converts a Date object to a number.
    */
    [Symbol.toPrimitive](hint: "number"): number;
    /**
    * Converts a Date object to a string or number.
    *
    * @param hint The strings "number", "string", or "default" to specify what primitive to return.
    *
    * @throws {TypeError} If 'hint' was given something other than "number", "string", or "default".
    * @returns A number if 'hint' was "number", a string if 'hint' was "string" or "default".
    */
    [Symbol.toPrimitive](hint: string): string | number;
}

declare class Map{
    readonly [Symbol.toStringTag]: string;
}

declare class WeakMap{
    readonly [Symbol.toStringTag]: string;
}

declare class Set{
    readonly [Symbol.toStringTag]: string;
}

declare class WeakSet{
    readonly [Symbol.toStringTag]: string;
}

declare class JSON {
    readonly [Symbol.toStringTag]: string;
}

declare class Function {
    /**
    * Determines whether the given value inherits from this function if this function was used
    * as a constructor function.
    *
    * A constructor function can control which objects are recognized as its instances by
    * 'instanceof' by overriding this method.
    */
    [Symbol.hasInstance](value: any): boolean;
}

declare interface Generator<T=any, TReturn = any> extends Iterator<T> {
    // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
    next(...args: any[]): IteratorResult<T, TReturn>;
    return(value: TReturn): IteratorResult<T, TReturn>;
    throw(e: any): IteratorResult<T, TReturn>;
    [Symbol.iterator](): Generator<T, TReturn>;
}

declare interface GeneratorFunction {
    readonly [Symbol.toStringTag]: string;
}

declare class Math {
    readonly [Symbol.toStringTag]: string;
}

declare class Promise {
    readonly [Symbol.species]: Promise;
    readonly [Symbol.toStringTag]: string;
}

declare class RegExp {
    /**
    * Matches a string with this regular expression, and returns an array containing the results of
    * that search.
    * @param string A string to search within.
    */
    [Symbol.match](string: string): RegExpMatchArray | null;

    /**
    * Replaces text in a string, using this regular expression.
    * @param string A String object or string literal whose contents matching against
    *               this regular expression will be replaced
    * @param replaceValue A String object or string literal containing the text to replace for every
    *                     successful match of this regular expression.
    */
    [Symbol.replace](string: string, replaceValue: string): string;

    /**
    * Replaces text in a string, using this regular expression.
    * @param string A String object or string literal whose contents matching against
    *               this regular expression will be replaced
    * @param replacer A function that returns the replacement text.
    */
    [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string;

    /**
    * Finds the position beginning first substring match in a regular expression search
    * using this regular expression.
    *
    * @param string The string to search within.
    */
    [Symbol.search](string: string): number;

    /**
    * Returns an array of substrings that were delimited by strings in the original input that
    * match against this regular expression.
    *
    * If the regular expression contains capturing parentheses, then each time this
    * regular expression matches, the results (including any undefined results) of the
    * capturing parentheses are spliced.
    *
    * @param string string value to split
    * @param limit if not undefined, the output array is truncated so that it contains no more
    * than 'limit' elements.
    */
    [Symbol.split](string: string, limit?: number): string[];

    readonly [Symbol.species]: RegExp;
}

declare class String {
    /**
    * Matches a string or an object that supports being matched against, and returns an array
    * containing the results of that search, or null if no matches are found.
    * @param matcher An object that supports being matched against.
    */
    match(matcher: { [Symbol.match](string: string): RegExpMatchArray | null; }): RegExpMatchArray | null;

    /**
    * Replaces first match with string or all matches with RegExp.
    * @param searchValue A string or RegExp search value.
    * @param replaceValue A string containing the text to replace for match.
    */
    replace(searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string): string;

    /**
    * Replaces text in a string, using an object that supports replacement within a string.
    * @param searchValue A object can search for and replace matches within a string.
    * @param replacer A function that returns the replacement text.
    */
    replace(searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string): string;

    /**
    * Finds the first substring match in a regular expression search.
    * @param searcher An object which supports searching within a string.
    */
    search(searcher: { [Symbol.search](string: string): number; }): number;

    /**
    * Split a string into substrings using the specified separator and return them as an array.
    * @param splitter An object that can split a string.
    * @param limit A value used to limit the number of elements returned in the array.
    */
    split(splitter: { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number): string[];
}

declare class ArrayBuffer {
    readonly [Symbol.toStringTag]: string;
}

declare class DataView {
    readonly [Symbol.toStringTag]: string;
}

declare class Int8Array {
    readonly [Symbol.toStringTag]: "Int8Array";
}

declare class Uint8Array {
    readonly [Symbol.toStringTag]: "Uint8Array";
}

declare class Uint8ClampedArray {
    readonly [Symbol.toStringTag]: "Uint8ClampedArray";
}

declare class Int16Array {
    readonly [Symbol.toStringTag]: "Int16Array";
}

declare class Uint16Array {
    readonly [Symbol.toStringTag]: "Uint16Array";
}

declare class Int32Array {
    readonly [Symbol.toStringTag]: "Int32Array";
}

declare class Uint32Array {
    readonly [Symbol.toStringTag]: "Uint32Array";
}

declare class Float32Array {
    readonly [Symbol.toStringTag]: "Float32Array";
}

declare class Float64Array {
    readonly [Symbol.toStringTag]: "Float64Array";
}

declare class Array{
    readonly [Symbol.species]: Array;
}
declare class Map{
    readonly [Symbol.species]: Map;
}
declare class Set{
    readonly [Symbol.species]: Set;
}
declare class ArrayBuffer {
    readonly [Symbol.species]: ArrayBuffer;
}

declare interface PromiseLike<T> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onfulfilled The callback to execute when the Promise is resolved.
    * @param onrejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): PromiseLike<TResult1 | TResult2>;
}

declare interface AsyncIterator<T, TReturn = any> {
    // NOTE: 'next' is defined using a tuple to ensure we report the correct assignability errors in all places.
    next(...args:any[]): Promise<IteratorResult<T, TReturn>>;
    return?(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>>;
    throw?(e?: any): Promise<IteratorResult<T, TReturn>>;
}

declare interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
}

declare interface AsyncIterableIterator<T> extends AsyncIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

/**
*  format a string
*/
import {Base64} from 'js-base64';
declare static class Base64{}

/**
* Get md5 string
*/
import md5 from 'blueimp-md5';
declare function md5(string:string):string;