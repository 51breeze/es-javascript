
declare interface ArrayLike<T> {
    const length: number;
    const [n: number]: T;
}

/**
 * Represents a raw buffer of binary data, which is used to store data for the
 * different typed arrays. ArrayBuffers cannot be read from or written to directly,
 * but can be passed to a typed array or DataView Object to interpret the raw
 * buffer as needed.
 */
declare class ArrayBuffer {
    /**
     * Read-only. The length of the ArrayBuffer (in bytes).
     */
    const byteLength: number;

    /**
     * Returns a section of an ArrayBuffer.
     */
    slice(begin: number, end?: number): ArrayBuffer;

    static isView(arg: any): boolean;
}

declare class SharedArrayBuffer {
    /**
     * Read-only. The length of the ArrayBuffer (in bytes).
     */
    const byteLength: number;

    /**
     * Returns a section of an SharedArrayBuffer.
     */
    slice(begin: number, end?: number): SharedArrayBuffer;

    static  isView(arg: any): boolean;
}


declare interface ArrayBufferView {
    /**
     * The ArrayBuffer instance referenced by the array.
     */
    buffer: ArrayBuffer | SharedArrayBuffer;

    /**
     * The length in bytes of the array.
     */
    byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    byteOffset: number;
}


/**
 * A typed array of 8-bit integer values. The contents are initialized to 0. If the requested
 * number of bytes could not be allocated an exception is raised.
 */
declare interface TypeArrayInterface<T> {
    /**
     * The size in bytes of each element in the array.
     */
    const BYTES_PER_ELEMENT: number;

    /**
     * The ArrayBuffer instance referenced by the array.
     */
    const buffer: ArrayBuffer | SharedArrayBuffer;
    
    /**
     * The length in bytes of the array.
     */
    const byteLength: number;

    /**
     * The offset in bytes of the array.
     */
    const byteOffset: number;

    /**
     * Returns the this object after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param end If not specified, length of the this object is used as its default value.
     */
    copyWithin(target: number, start: number, end?: number): this;

    /**
     * Determines whether all the members of an array satisfy the specified test.
     * @param predicate A function that accepts up to three arguments. The every method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value false, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    every(predicate: (value: number, index: number, array: T) => boolean, thisArg?: any): boolean;

    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param value value to fill array section with
     * @param start index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array.
     * @param end index to stop filling the array at. If end is negative, it is treated as
     * length+end.
     */
    fill(value: number, start?: number, end?: number): this;

    /**
     * Returns the elements of an array that meet the condition specified in a callback function.
     * @param predicate A function that accepts up to three arguments. The filter method calls
     * the predicate function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    filter(predicate: (value: number, index: number, array: T) => any, thisArg?: any): T;

    /**
     * Returns the value of the first element in the array where predicate is true, and undefined
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found, find
     * immediately returns that element value. Otherwise, find returns undefined.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    find(predicate: (value: number, index: number, obj: T) => boolean, thisArg?: any): number;

    /**
     * Returns the index of the first element in the array where predicate is true, and -1
     * otherwise.
     * @param predicate find calls predicate once for each element of the array, in ascending
     * order, until it finds one where predicate returns true. If such an element is found,
     * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
     * @param thisArg If provided, it will be used as the this value for each invocation of
     * predicate. If it is not provided, undefined is used instead.
     */
    findIndex(predicate: (value: number, index: number, obj: Int8Array) => boolean, thisArg?: any): number;

    /**
     * Performs the specified action for each element in an array.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: number, index: number, array: Int8Array) => void, thisArg?: any): void;

    /**
     * Returns the index of the first occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     *  search starts at index 0.
     */
    indexOf(searchElement: number, fromIndex?: number): number;

    /**
     * Adds all the elements of an array separated by the specified separator string.
     * @param separator A string used to separate one element of an array from the next in the
     * resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator?: string): string;

    /**
     * Returns the index of the last occurrence of a value in an array.
     * @param searchElement The value to locate in the array.
     * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the
     * search starts at index 0.
     */
    lastIndexOf(searchElement: number, fromIndex?: number): number;

    /**
     * The length of the array.
     */
    const length: number;

    /**
     * Calls a defined callback function on each element of an array, and returns an array that
     * contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the
     * callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn: (value: number, index: number, array: T) => number, thisArg?: any): T;


    /**
     * Calls the specified callback function for all the elements in an array. The return value of
     * the callback function is the accumulated result, and is provided as an argument in the next
     * call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
     * callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduce<U=number>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int8Array) => U, initialValue?: U): U;


    /**
     * Calls the specified callback function for all the elements in an array, in descending order.
     * The return value of the callback function is the accumulated result, and is provided as an
     * argument in the next call to the callback function.
     * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
     * the callbackfn function one time for each element in the array.
     * @param initialValue If initialValue is specified, it is used as the initial value to start
     * the accumulation. The first call to the callbackfn function provides this value as an argument
     * instead of an array value.
     */
    reduceRight<U=number>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Int8Array) => U, initialValue?: U): U;

    /**
     * Reverses the elements in an Array.
     */
    reverse(): Int8Array;

    /**
     * Sets a value or an array of values.
     * @param array A typed or untyped array of values to set.
     * @param offset The index in the current array at which the values are to be written.
     */
    set(array: Array<number>, offset?: number): void;

    /**
     * Returns a section of an array.
     * @param start The beginning of the specified portion of the array.
     * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
     */
    slice(start?: number, end?: number): T;

    /**
     * Determines whether the specified callback function returns true for any element of an array.
     * @param predicate A function that accepts up to three arguments. The some method calls
     * the predicate function for each element in the array until the predicate returns a value
     * which is coercible to the Boolean value true, or until the end of the array.
     * @param thisArg An object to which the this keyword can refer in the predicate function.
     * If thisArg is omitted, undefined is used as the this value.
     */
    some(predicate: (value: number, index: number, array: T) => boolean, thisArg?: any): boolean;

    /**
     * Sorts an array.
     * @param compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if first argument is less than second argument, zero if they're equal and a positive
     * value otherwise. If omitted, the elements are sorted in ascending order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     */
    sort(compareFn?: (a: number, b: number) => number): this;

    /**
     * Gets a new Int8Array view of the ArrayBuffer store for this array, referencing the elements
     * at begin, inclusive, up to end, exclusive.
     * @param begin The index of the beginning of the array.
     * @param end The index of the end of the array.
     */
    subarray(begin?: number, end?: number): T;

    /**
     * Converts a number to a string by using the current locale.
     */
    toLocaleString(): string;

    /**
     * Returns a string representation of an array.
     */
    toString(): string;

    /** Returns the primitive value of the specified object. */
    valueOf(): T;

    [index: number]: number;
}

declare class BaseTypeArray<T> implements TypeArrayInterface<T>{

    constructor(length:number | Array<number>):T;

    /**
     * Returns a new array from a set of elements.
     * @param items A set of elements to include in the new array object.
     */
    of(...items: number[]): T;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     */
    from(arrayLike: ArrayLike<number>): T;

    /**
     * Creates an array from an array-like or iterable object.
     * @param arrayLike An array-like or iterable object to convert to an array.
     * @param mapfn A mapping function to call on every element of the array.
     * @param thisArg Value of 'this' used to invoke the mapfn.
     */
    from<V>(arrayLike: ArrayLike<V>, mapfn: (v: V, k: number) => number, thisArg?: any): T;
}


declare class Int8Array extends BaseTypeArray<Int8Array>{
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}

declare class Uint8Array extends BaseTypeArray<Uint8Array> {
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}

declare class Uint8ClampedArray extends BaseTypeArray<Uint8ClampedArray> {
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}

declare class Int16Array extends BaseTypeArray<Int16Array> {
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}

declare class Uint16Array extends BaseTypeArray<Uint16Array> {
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}

declare class  Int32Array extends BaseTypeArray<Int32Array> {
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}


declare class  Uint32Array extends BaseTypeArray<Uint32Array> {
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}


declare class  Float32Array extends BaseTypeArray<Float32Array> {
    /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;
}

declare class  Float64Array extends BaseTypeArray<Float64Array> {
   /**
     * The size in bytes of each element in the array.
     */
    static const BYTES_PER_ELEMENT: number;

}

declare interface ReadableStreamGenericReader {
    const closed: Promise<void>;
    cancel(reason?: any): Promise<void>;
}

declare interface ReadableStreamDefaultReader<R = any> extends ReadableStreamGenericReader {
    read(): Promise<{done:boolean,value?:R}>;
    releaseLock(): void;
}

declare interface WritableStreamDefaultWriter<W = any> {
    const closed: Promise<void>;
    const desiredSize: number | null;
    const ready: Promise<void>;
    abort(reason?: any): Promise<void>;
    close(): Promise<void>;
    releaseLock(): void;
    write(chunk?: W): Promise<void>;
}

/** This Streams API interface provides a standard abstraction for writing streaming data to a destination, known as a sink. This object comes with built-in backpressure and queuing. */
declare interface WritableStream<W = any> {
    const locked: boolean;
    abort(reason?: any): Promise<void>;
    close(): Promise<void>;
    getWriter(): WritableStreamDefaultWriter<W>;
}

declare interface ReadableWritablePair<R = any, W = any> {
    readable: ReadableStream<R>;
    /**
     * Provides a convenient, chainable way of piping this readable stream through a transform stream (or any other { writable, readable } pair). It simply pipes the stream into the writable side of the supplied pair, and returns the readable side for further use.
     *
     * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
     */
    writable: WritableStream<W>;
}

/** A signal object that allows you to communicate with a DOM request (such as a Fetch) and abort it if required via an AbortController object. */
declare interface AbortSignal extends EventDispatcher {
    /** Returns true if this AbortSignal's AbortController has signaled to abort, and false otherwise. */
    const aborted: boolean;
    onabort:(ev:Event)=>any;
    const reason: any;
    throwIfAborted(): void;
}

declare interface StreamPipeOptions {
    preventAbort?: boolean;
    preventCancel?: boolean;
    /**
     * Pipes this readable stream to a given writable stream destination. The way in which the piping process behaves under various error conditions can be customized with a number of passed options. It returns a promise that fulfills when the piping process completes successfully, or rejects if any errors were encountered.
     *
     * Piping a stream will lock it for the duration of the pipe, preventing any other consumer from acquiring a reader.
     *
     * Errors and closures of the source and destination streams propagate as follows:
     *
     * An error in this source readable stream will abort destination, unless preventAbort is truthy. The returned promise will be rejected with the source's error, or with any error that occurs during aborting the destination.
     *
     * An error in destination will cancel this source readable stream, unless preventCancel is truthy. The returned promise will be rejected with the destination's error, or with any error that occurs during canceling the source.
     *
     * When this source readable stream closes, destination will be closed, unless preventClose is truthy. The returned promise will be fulfilled once this process completes, unless an error is encountered while closing the destination, in which case it will be rejected with that error.
     *
     * If destination starts out closed or closing, this source readable stream will be canceled, unless preventCancel is true. The returned promise will be rejected with an error indicating piping to a closed stream failed, or with any error that occurs during canceling the source.
     *
     * The signal option can be set to an AbortSignal to allow aborting an ongoing pipe operation via the corresponding AbortController. In this case, this source readable stream will be canceled, and destination aborted, unless the respective options preventCancel or preventAbort are set.
     */
    preventClose?: boolean;
    signal?: AbortSignal;
}


/** This Streams API interface represents a readable stream of byte data. The Fetch API offers a concrete instance of a ReadableStream through the body property of a Response object. */
declare interface ReadableStream<R = any> {
    const locked: boolean;
    cancel(reason?: any): Promise<void>;
    getReader(): ReadableStreamDefaultReader<R>;
    pipeThrough<T>(transform: ReadableWritablePair<T, R>, options?: StreamPipeOptions): ReadableStream<T>;
    pipeTo(destination: WritableStream<R>, options?: StreamPipeOptions): Promise<void>;
    tee(): [ReadableStream<R>, ReadableStream<R>];
}

/** A file-like object of immutable, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File interface is based on Blob, inheriting blob functionality and expanding it to support files on the user's system. */
declare interface Blob {
    const size: number;
    const type: string;
    arrayBuffer(): Promise<ArrayBuffer>;
    slice(start?: number, end?: number, contentType?: string): Blob;
    stream(): ReadableStream<Uint8Array>;
    text(): Promise<string>;
}

/** Provides information about files and allows JavaScript in a web page to access their content. */
declare class File extends Blob {
    const lastModified: number;
    const name: string;
    const webkitRelativePath: string;
}

declare class FormData {
    append(name: string, value: string | Blob, fileName?: string): void;
    delete(name: string): void;
    get(name: string): File | string;
    getAll(name: string): (File | string)[];
    has(name: string): boolean;
    set(name: string, value: string | Blob, fileName?: string): void;
    forEach(callbackfn: (value: File | string, key: string, parent: FormData) => void, thisArg?: any): void;
}
