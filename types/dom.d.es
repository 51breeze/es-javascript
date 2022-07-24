declare interface ElementDefinitionOptions {
    extends?: string;
}

declare class CustomElementConstructor {
    constructor(...params: any[]): HTMLElement;
}

declare class CustomElementRegistry {
    define(name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions): void;
    get(name: string): CustomElementConstructor;
    upgrade(root: Node): void;
    whenDefined(name: string): Promise<CustomElementConstructor>;
}

/** Used to represent a set of time ranges, primarily for the purpose of tracking which portions of media have been buffered when loading it for use by the <audio> and <video> elements. */
declare class TimeRanges {
    /** Returns the number of ranges in the object. */
    const length: number;
    /**
     * Returns the time for the end of the range with the given index.
     *
     * Throws an "IndexSizeError" DOMException if the index is out of range.
     */
    end(index: number): number;
    /**
     * Returns the time for the start of the range with the given index.
     *
     * Throws an "IndexSizeError" DOMException if the index is out of range.
     */
    start(index: number): number;
}

/** A chunk of media to be passed into an HTMLMediaElement and played, via a MediaSource object. This can be made up of one or several media segments. */
declare interface SourceBuffer extends EventDispatcher {
    appendWindowEnd: number;
    appendWindowStart: number;
    const buffered: TimeRanges;
    mode: "segments" | "sequence";
    onabort: (ev: Event) => any
    onerror: (ev: Event) => any
    onupdate: (ev: Event) => any
    onupdateend: (ev: Event) => any
    onupdatestart: (ev: Event) => any
    timestampOffset: number;
    const updating: boolean;
    abort(): void;
    appendBuffer(data: ArrayBufferView | ArrayBuffer): void;
    changeType(type: string): void;
    remove(start: number, end: number): void;
}

/** A simple container list for multiple SourceBuffer objects. */
declare interface SourceBufferList extends EventDispatcher {
    const length: number;
    onaddsourcebuffer: (ev: Event) => any;
    onremovesourcebuffer: (ev: Event) => any
    [index: number]: SourceBuffer;
}

/** This Media Source Extensions API interface represents a source of media data for an HTMLMediaElement object. A MediaSource object can be attached to a HTMLMediaElement to be played in the user agent. */
declare interface MediaSource extends EventDispatcher {
    const activeSourceBuffers: SourceBufferList;
    duration: number;
    onsourceclose: ( ev: Event) => any;
    onsourceended: ( ev: Event) => any;
    onsourceopen: ( ev: Event) => any;
    const readyState: "closed" | "ended" | "open";
    const sourceBuffers: SourceBufferList;
    addSourceBuffer(type: string): SourceBuffer;
    clearLiveSeekableRange(): void;
    endOfStream(error?: "decode" | "network"): void;
    removeSourceBuffer(sourceBuffer: SourceBuffer): void;
    setLiveSeekableRange(start: number, end: number): void;
}

declare class URLSearchParams {
    constructor(init?: string[][] | string | URLSearchParams)
    /** Appends a specified key/value pair as a new search parameter. */
    append(name: string, value: string): void;
    /** Deletes the given search parameter, and its associated value, from the list of all search parameters. */
    delete(name: string): void;
    /** Returns the first value associated to the given search parameter. */
    get(name: string): string | null;
    /** Returns all the values association with a given search parameter. */
    getAll(name: string): string[];
    /** Returns a Boolean indicating if such a search parameter exists. */
    has(name: string): boolean;
    /** Sets the value associated to a given search parameter to the given value. If there were several values, delete the others. */
    set(name: string, value: string): void;
    sort(): void;
    /** Returns a string containing a query string suitable for use in a URL. Does not include the question mark. */
    toString(): string;
    forEach(callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any): void;
}


/** The URL interface represents an object providing static methods used for creating object URLs. */

declare class URL {
    static createObjectURL(obj: Blob | MediaSource): string;
    static revokeObjectURL(url: string): void;

    const origin: string;
    constructor(url: string | URL, base?: string | URL);
    hash: string;
    host: string;
    hostname: string;
    href: string;
    toString(): string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    const searchParams: URLSearchParams;
    username: string;
    toJSON(): string;

}

declare class  History {
    const length: number;
    scrollRestoration: "auto" | "manual";
    const state: any;
    back(): void;
    forward(): void;
    go(delta?: number): void;
    pushState(data: any, unused: string, url?: string | URL | null): void;
    replaceState(data: any, unused: string, url?: string | URL | null): void;
}

declare class BarProp {
    const visible: boolean;
}

declare interface ScreenOrientation extends IEventDispatcher {
    const angle: number;
    onchange: (ev: Event) => any;
    const type: "landscape-primary" | "landscape-secondary" | "portrait-primary" | "portrait-secondary";
    lock(orientation: "any" | "landscape" | "landscape-primary" | "landscape-secondary" | "natural" | "portrait" | "portrait-primary" | "portrait-secondary"): Promise<any>;
    unlock(): void;
}

/** A screen, usually the one on which the current window is being rendered, and is obtained using window.screen. */
declare interface Screen {
    const availHeight: number;
    const availWidth: number;
    const colorDepth: number;
    const height: number;
    const orientation: ScreenOrientation;
    const pixelDepth: number;
    const width: number;
}

/** This Web Speech API interface represents a voice that the system supports. Every SpeechSynthesisVoice has its own relative speech service including information about language, name and URI. */
declare interface SpeechSynthesisVoice {
    const default: boolean;
    const lang: string;
    const localService: boolean;
    const name: string;
    const voiceURI: string;
}

/** This Web Speech API interface represents a speech request. It contains the content the speech service should read and information about how to read it (e.g. language, pitch and volume.) */
declare interface SpeechSynthesisUtterance extends IEventDispatcher {
    lang: string;
    onboundary: (ev: SpeechSynthesisEvent) => any;
    onend: (ev: SpeechSynthesisEvent) => any;
    onerror: (ev: SpeechSynthesisErrorEvent) => any;
    onmark: (ev: SpeechSynthesisEvent) => any;
    onpause: (ev: SpeechSynthesisEvent) => any;
    onresume: (ev: SpeechSynthesisEvent) => any;
    onstart: (ev: SpeechSynthesisEvent) => any;
    pitch: number;
    rate: number;
    text: string;
    voice: SpeechSynthesisVoice | null;
    volume: number;
}

/** This Web Speech API interface is the controller interface for the speech service; this can be used to retrieve information about the synthesis voices available on the device, start and pause speech, and other commands besides. */
declare interface SpeechSynthesis extends IEventDispatcher {
    onvoiceschanged: (ev: Event) => any;
    const paused: boolean;
    const pending: boolean;
    const speaking: boolean;
    cancel(): void;
    getVoices(): SpeechSynthesisVoice[];
    pause(): void;
    resume(): void;
    speak(utterance: SpeechSynthesisUtterance): void;
}


declare interface VisualViewport extends IEventDispatcher {
    const height: number;
    const offsetLeft: number;
    const offsetTop: number;
    onresize: ( ev: Event) => any;
    onscroll: ( ev: Event) => any;
    const pageLeft: number;
    const pageTop: number;
    const scale: number;
    const width: number;
}

declare interface AbstractRange {
    /** Returns true if range is collapsed, and false otherwise. */
    const collapsed: boolean;
    /** Returns range's end node. */
    const endContainer: Node;
    /** Returns range's end offset. */
    const endOffset: number;
    /** Returns range's start node. */
    const startContainer: Node;
    /** Returns range's start offset. */
    const startOffset: number;
}


/** A minimal document object that has no parent. It is used as a lightweight version of Document that stores a segment of a document structure comprised of nodes just like a standard document. The key difference is that because the document fragment isn't part of the active document tree structure, changes made to the fragment don't affect the document, cause reflow, or incur any performance impact that can occur when changes are made. */
declare interface DocumentFragment extends ParentNode {
    const ownerDocument: Document;
    getElementById(elementId: string): HTMLElement | null;
}

/** A fragment of a document that can contain nodes and parts of text nodes. */
declare class Range extends AbstractRange {
    /** Returns the node, furthest away from the document, that is an ancestor of both range's start node and end node. */
    const commonAncestorContainer: Node;
    cloneContents(): DocumentFragment;
    cloneRange(): Range;
    collapse(toStart?: boolean): void;
    compareBoundaryPoints(how: number, sourceRange: Range): number;
    /** Returns −1 if the point is before the range, 0 if the point is in the range, and 1 if the point is after the range. */
    comparePoint(node: Node, offset: number): number;
    createContextualFragment(fragment: string): DocumentFragment;
    deleteContents(): void;
    detach(): void;
    extractContents(): DocumentFragment;
    getBoundingClientRect(): DOMRect;
    getClientRects(): DOMRectList;
    insertNode(node: Node): void;
    /** Returns whether range intersects node. */
    intersectsNode(node: Node): boolean;
    isPointInRange(node: Node, offset: number): boolean;
    selectNode(node: Node): void;
    selectNodeContents(node: Node): void;
    setEnd(node: Node, offset: number): void;
    setEndAfter(node: Node): void;
    setEndBefore(node: Node): void;
    setStart(node: Node, offset: number): void;
    setStartAfter(node: Node): void;
    setStartBefore(node: Node): void;
    surroundContents(newParent: Node): void;

    const END_TO_END: number;
    const END_TO_START: number;
    const START_TO_END: number;
    const START_TO_START: number;
}


/** A Selection object represents the range of text selected by the user or the current position of the caret. To obtain a Selection object for examination or modification, call Window.getSelection(). */
declare class Selection {
    const anchorNode: Node | null;
    const anchorOffset: number;
    const focusNode: Node | null;
    const focusOffset: number;
    const isCollapsed: boolean;
    const rangeCount: number;
    const type: string;
    addRange(range: Range): void;
    collapse(node: Node | null, offset?: number): void;
    collapseToEnd(): void;
    collapseToStart(): void;
    containsNode(node: Node, allowPartialContainment?: boolean): boolean;
    deleteFromDocument(): void;
    empty(): void;
    extend(node: Node, offset?: number): void;
    getRangeAt(index: number): Range;
    removeAllRanges(): void;
    removeRange(range: Range): void;
    selectAllChildren(node: Node): void;
    setBaseAndExtent(anchorNode: Node, anchorOffset: number, focusNode: Node, focusOffset: number): void;
    setPosition(node: Node | null, offset?: number): void;
    toString(): string;
}


/** Stores information on a media query applied to a document, and handles sending notifications to listeners when the media query state change (i.e. when the media query test starts or stops evaluating to true). */
declare class MediaQueryList extends EventDispatcher {
    const matches: boolean;
    const media: string;
    onchange: (ev: MediaQueryListEvent) => any;
}


declare class ImageBitmap {
    /** Returns the intrinsic height of the image, in CSS pixels. */
    const height: number;
    /** Returns the intrinsic width of the image, in CSS pixels. */
    const width: number;
    /** Releases imageBitmap's underlying bitmap data. */
    close(): void;
}

declare class ImageBitmapRenderingContext {
    /** Returns the canvas element that the context is bound to. */
    const canvas: HTMLCanvasElement;
    /** Transfers the underlying bitmap data from imageBitmap to context, and the bitmap becomes the contents of the canvas element to which context is bound. */
    transferFromImageBitmap(bitmap: ImageBitmap | null): void;
}

type PredefinedColorSpace = "display-p3" | "srgb";

declare interface ImageDataSettings {
    colorSpace?: PredefinedColorSpace;
}

/** The underlying pixel data of an area of a <canvas> element. It is created using the ImageData() constructor or creator methods on the CanvasRenderingContext2D object associated with a canvas: createImageData() and getImageData(). It can also be used to set a part of the canvas by using putImageData(). */
declare class ImageData {
    const colorSpace: PredefinedColorSpace;
    /** Returns the one-dimensional array containing the data in RGBA order, as integers in the range 0 to 255. */
    const data: Uint8ClampedArray;
    /** Returns the actual dimensions of the data in the ImageData object, in pixels. */
    const height: number;
    /** Returns the actual dimensions of the data in the ImageData object, in pixels. */
    const width: number;
    constructor(data: Uint8ClampedArray, sw: number, sh?: number, settings?: ImageDataSettings);
}

/** This Channel Messaging API interface represents one of the two ports of a MessageChannel, allowing messages to be sent from one port and listening out for them arriving at the other. */
declare interface MessagePort extends IEventDispatcher {
    onmessage: (ev: MessageEvent) => any;
    onmessageerror: (ev: MessageEvent) => any;
    /** Disconnects the port, so that it is no longer active. */
    close(): void;
    /**
     * Posts a message through the channel. Objects listed in transfer are transferred, not just cloned, meaning that they are no longer usable on the sending side.
     *
     * Throws a "DataCloneError" DOMException if transfer contains duplicate objects or port, or if message could not be cloned.
     */
    postMessage(message: any, options: Transferable[] | StructuredSerializeOptions ): void;

    /** Begins dispatching messages received on the port. */
    start(): void;
  
}

declare type Transferable = ArrayBuffer | MessagePort | ImageBitmap;

declare interface StructuredSerializeOptions {
    transfer?: Transferable[];
}

declare interface WindowPostMessageOptions extends StructuredSerializeOptions {
    targetOrigin?: string;
}

declare interface IdleDeadline {
    const didTimeout: boolean;
    timeRemaining(): number;
}

declare interface Window implements IEventDispatcher,GlobalEventHandlers{

    const location:Location;
    const document:Document;

    /** Returns true if the window has been closed, false otherwise. */
    const closed: boolean;
    /** Defines a new custom element, mapping the given name to the given constructor as an autonomous custom element. */
    const customElements: CustomElementRegistry;
    const devicePixelRatio: number;
   
    const frameElement: Element | null;
    const frames: Window;
    const history: History;
    const innerHeight: number;
    const innerWidth: number;
    const length: number;

    get location(): Location;
    set location(href: string | Location);

    /** Returns true if the location bar is visible; otherwise, returns false. */
    const locationbar: BarProp;
    /** Returns true if the menu bar is visible; otherwise, returns false. */
    const menubar: BarProp;

    name: string;
    const navigator: {[key:string]:any};
    /** Available only in secure contexts. */
    ondevicemotion: (ev: DeviceMotionEvent) => any;
    /** Available only in secure contexts. */
    ondeviceorientation: (ev: DeviceOrientationEvent) => any;
    /** @deprecated */
    onorientationchange: (ev: Event) => any;
    opener: any;
    /** @deprecated */
    const orientation: number;
    const outerHeight: number;
    const outerWidth: number;
    /** @deprecated This is a legacy alias of `scrollX`. */
    const pageXOffset: number;
    /** @deprecated This is a legacy alias of `scrollY`. */
    const pageYOffset: number;
    /**
     * Refers to either the parent WindowProxy, or itself.
     *
     * It can rarely be null e.g. for contentWindow of an iframe that is already removed from the parent.
     */
    const parent: Window;
    /** Returns true if the personal bar is visible; otherwise, returns false. */
    const personalbar: BarProp;
    const screen: Screen;
    const screenLeft: number;
    const screenTop: number;
    const screenX: number;
    const screenY: number;
    const scrollX: number;
    const scrollY: number;
    /** Returns true if the scrollbars are visible; otherwise, returns false. */
    const scrollbars: BarProp;
    const self: Window;
    const speechSynthesis: SpeechSynthesis;
    /** @deprecated */
    status: string;
    /** Returns true if the status bar is visible; otherwise, returns false. */
    const statusbar: BarProp;
    /** Returns true if the toolbar is visible; otherwise, returns false. */
    const toolbar: BarProp;
    const top: Window | null;
    const visualViewport: VisualViewport;
    const window: Window;
    alert(message?: any): void;
    blur(): void;
    cancelIdleCallback(handle: number): void;
    /** @deprecated */
    captureEvents(): void;
    /** Closes the window. */
    close(): void;
    confirm(message?: string): boolean;
    /** Moves the focus to the window's browsing context, if any. */
    focus(): void;
    getComputedStyle(elt: Element, pseudoElt?: string | null): CSSStyleDeclaration;
    getSelection(): Selection | null;
    matchMedia(query: string): MediaQueryList;
    moveBy(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    open(url?: string | URL, target?: string, features?: string): Window | null;
    /**
     * Posts a message to the given window. Messages can be structured objects, e.g. nested objects and arrays, can contain JavaScript values (strings, numbers, Date objects, etc), and can contain certain data objects such as File Blob, FileList, and ArrayBuffer objects.
     *
     * Objects listed in the transfer member of options are transferred, not just cloned, meaning that they are no longer usable on the sending side.
     *
     * A target origin can be specified using the targetOrigin member of options. If not provided, it defaults to "/". This default restricts the message to same-origin targets only.
     *
     * If the origin of the target window doesn't match the given target origin, the message is discarded, to avoid information leakage. To send the message to the target regardless of origin, set the target origin to "*".
     *
     * Throws a "DataCloneError" DOMException if transfer array contains duplicate objects or if message could not be cloned.
     */
    postMessage(message: any, targetOrigin: string, transfer?: Transferable[]): void;
    //postMessage(message: any, options?: WindowPostMessageOptions): void;
    print(): void;
    prompt(message?: string, _default?: string): string | null;
    /** @deprecated */
    releaseEvents(): void;
    requestIdleCallback(callback: (deadline: IdleDeadline)=>void, options?: {timeout?: number}): number;
    resizeBy(x: number, y: number): void;
    resizeTo(width: number, height: number): void;
    scroll(x: number | ScrollToOptions, y?: number): void;
    scrollBy(x: number | ScrollToOptions, y?: number): void;
    scrollTo(x: number | ScrollToOptions, y?: number): void;
    /** Cancels the document load. */
    stop(): void;
    [index: number]: Window;
    [key:string]:any;
}

declare const window:Window;

declare interface DocumentAndElementEventHandlers {
    oncopy: (ev: ClipboardEvent) => any;
    oncut: (ev: ClipboardEvent) => any;
    onpaste: (ev: ClipboardEvent) => any;
}

declare interface Document implements IEventDispatcher,GlobalEventHandlers,DocumentAndElementEventHandlers{
    get activeElement():HTMLElement;
    get body():HTMLElement;
    get defaultView():Window;
    get title():string;
    get links():HTMLCollectionOf<HTMLAnchorElement | HTMLAreaElement>;
    get location ():Location;
    set location(href: string | Location);
    get compatMode():'BackCompat' | 'CSS1Compat';
    get designMode():'on' | 'off';
    get contentType():any;
    get doctype():object;
    get documentElement():Document;
    get documentURI():string;
    get forms():HTMLCollection;

    get readyState(): "complete" | "interactive" | "loading";

    /** Sets or gets the security domain of the document. */
    domain: string;

    /** Returns true if document has the ability to display elements fullscreen and fullscreen is supported, or false otherwise. */
    const fullscreenEnabled: boolean;
    /** Returns the head element. */
    const head: HTMLHeadElement;
    const hidden: boolean;
    /** Retrieves a collection, in source order, of img objects in the document. */
    const images: HTMLCollectionOf<HTMLImageElement>;

    /**  Returns an empty range object that has both of its boundary points positioned at the beginning of the document. */
    createRange(): Range;

    requestFullscreen():void;
    createElement(name:string):Element;
    createTextNode(name:string):Node;
    createComment(name:string):Node;
    createDocumentFragment(name:string):Node;
    createAttribute():Attr;
    querySelector(selector:string):Element|null;
    querySelectorAll(selector:string):NodeList;
    getElementById(name:string):Element;

     /** Stops document's fullscreen element from being displayed fullscreen and resolves promise when done. */
    exitFullscreen(): Promise<void>;
    exitPictureInPicture(): Promise<void>;
    exitPointerLock(): void;


     /** Returns a HTMLCollection of the elements in the object on which the method was invoked (a document or an element) that have all the classes given by classNames. The classNames argument is interpreted as a space-separated list of classes. */
    getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
    /**
     * Gets a collection of objects based on the value of the NAME or ID attribute.
     * @param elementName Gets a collection of objects based on the value of the NAME or ID attribute.
     */
    getElementsByName(elementName: string): NodeListOf<HTMLElement>;
    /**
     * Retrieves a collection of objects based on the specified element name.
     * @param name Specifies the name of an element.
     */
    getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element>;


    /** Returns an object representing the current selection of the document that is loaded into the object displaying a webpage. */
    getSelection(): Selection | null;
    /** Gets a value indicating whether the object currently has focus. */
    hasFocus(): boolean;
    hasStorageAccess(): Promise<boolean>;
    /**
     * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
     *
     * If node is a document or a shadow root, throws a "NotSupportedError" DOMException.
     */
    importNode<T extends Node>(node: T, deep?: boolean): T;


    onfullscreenchange: (ev: Event) => any;
    onfullscreenerror: (ev: Event) => any;
    onpointerlockchange: (ev: Event) => any;
    onpointerlockerror: (ev: Event) => any;
    /**
     * Fires when the state of the object has changed.
     * @param ev The event
     */
    onreadystatechange: (ev: Event) => any;
    onvisibilitychange: (ev: Event) => any;

    [key:string]:any;
}

declare const document:Document;

declare interface HTMLBodyElement extends HTMLElement{}
declare interface HTMLHeadElement extends HTMLElement{}
declare interface HTMLImageElement extends HTMLElement{}
declare interface HTMLCanvasElement extends HTMLElement{}
declare interface HTMLAnchorElement extends HTMLElement{}
declare interface HTMLAreaElement extends HTMLElement{}

declare interface NodeList {
    /**
     * Returns the number of nodes in the collection.
     */
    const length: number;
    /**
     * Returns the node with index index from the collection. The nodes are sorted in tree order.
     */
    item(index: number): Node | null;
    /**
     * Performs the specified action for each node in an list.
     * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the list.
     * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    forEach(callbackfn: (value: Node, key: number, parent: NodeList) => void, thisArg?: any): void;

    entries():Iterator<Element>;

    keys():Iterator<uint>;

    values():Iterator<Element>;

    [key:number]:Node;
}

declare interface NodeListOf<TNode extends Node> extends NodeList {}

declare interface ElementContentEditable {
    contentEditable: string;
    enterKeyHint: string;
    inputMode: string;
    const isContentEditable: boolean;
}

declare interface GetRootNodeOptions {
    var composed?: boolean;
}

declare class Node extends EventDispatcher{

     /**
     * Returns node's node document's document base URL.
     */
    const baseURI: string;
    /**
     * Returns the children.
     */
    const childNodes: NodeListOf<ChildNode>;
    /**
     * Returns the first child.
     */
    const firstChild: ChildNode | null;
    /**
     * Returns true if node is connected and false otherwise.
     */
    const isConnected: boolean;
    /**
     * Returns the last child.
     */
    const lastChild: ChildNode | null;
    /**
     * Returns the next sibling.
     */
    const nextSibling: ChildNode | null;
    /**
     * Returns a string appropriate for the type of node.
     */
    const nodeName: string;
    /**
     * Returns the type of node.
     */
    const nodeType: number;
    const nodeValue: string | null;
    /**
     * Returns the node document. Returns null for documents.
     */
    const ownerDocument: Document | null;
    /**
     * Returns the parent element.
     */
    const parentElement: HTMLElement | null;
    /**
     * Returns the parent.
     */
    const parentNode: ParentNode | null;
    /**
     * Returns the previous sibling.
     */
    const previousSibling: ChildNode | null;
    const textContent: string | null;
    appendChild<T extends Node>(node: T): T;
    /**
     * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
     */
    cloneNode(deep?: boolean): Node;
    /**
     * Returns a bitmask indicating the position of other relative to node.
     */
    compareDocumentPosition(other: Node): number;
    /**
     * Returns true if other is an inclusive descendant of node, and false otherwise.
     */
    contains(other: Node | null): boolean;
    /**
     * Returns node's root.
     */
    getRootNode(options?: GetRootNodeOptions): Node;
    /**
     * Returns whether node has children.
     */
    hasChildNodes(): boolean;
    insertBefore<T extends Node>(node: T, child: Node | null): T;
    isDefaultNamespace(namespace: string | null): boolean;
    /**
     * Returns whether node and otherNode have the same properties.
     */
    isEqualNode(otherNode: Node | null): boolean;
    isSameNode(otherNode: Node | null): boolean;
    lookupNamespaceURI(prefix: string | null): string | null;
    lookupPrefix(namespace: string | null): string | null;
    /**
     * Removes empty exclusive Text nodes and concatenates the data of remaining contiguous exclusive Text nodes into the first of their nodes.
     */
    normalize(): void;
    removeChild<T extends Node>(child: T): T;
    replaceChild<T extends Node>(node: Node, child: T): T;

    static const ATTRIBUTE_NODE: number;
    /**
     * node is a CDATASection node.
     */
    static const CDATA_SECTION_NODE: number;
    /**
     * node is a Comment node.
     */
    static const COMMENT_NODE: number;
    /**
     * node is a DocumentFragment node.
     */
    static const DOCUMENT_FRAGMENT_NODE: number;
    /**
     * node is a document.
     */
    static const DOCUMENT_NODE: number;
    /**
     * Set when other is a descendant of node.
     */
    static const DOCUMENT_POSITION_CONTAINED_BY: number;
    /**
     * Set when other is an ancestor of node.
     */
    static const DOCUMENT_POSITION_CONTAINS: number;
    /**
     * Set when node and other are not in the same tree.
     */
    static const DOCUMENT_POSITION_DISCONNECTED: number;
    /**
     * Set when other is following node.
     */
    static const DOCUMENT_POSITION_FOLLOWING: number;
    static const DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
    /**
     * Set when other is preceding node.
     */
    static const DOCUMENT_POSITION_PRECEDING: number;
    /**
     * node is a doctype.
     */
    static const DOCUMENT_TYPE_NODE: number;
    /**
     * node is an element.
     */
    static const ELEMENT_NODE: number;
    static const ENTITY_NODE: number;
    static const ENTITY_REFERENCE_NODE: number;
    static const NOTATION_NODE: number;
    /**
     * node is a ProcessingInstruction node.
     */
    static const PROCESSING_INSTRUCTION_NODE: number;
    /**
     * node is a Text node.
     */
    static const TEXT_NODE: number;
}

/** A generic collection (array-like object similar to arguments) of elements (in document order) and offers methods and properties for selecting from the list. */
declare interface HTMLCollectionBase {
    /**
     * Sets or retrieves the number of objects in a collection.
     */
    length: number;
    /**
     * Retrieves an object from various collections.
     */
    item(index: number): Element | null;

    [index:number]:Element
}

declare interface HTMLCollection extends HTMLCollectionBase {
    /**
     * Retrieves a select object or an object from an options collection.
     */
    namedItem(name: string): Element | null;
}

declare interface ParentNode extends Node {
    const childElementCount: number;
    /**
     * Returns the child elements.
     */
    const children: HTMLCollection;
    /**
     * Returns the first child that is an element, and null otherwise.
     */
    const firstElementChild: Element | null;
    /**
     * Returns the last child that is an element, and null otherwise.
     */
    const lastElementChild: Element | null;
    /**
     * Inserts nodes after the last child of node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     */
    append(...nodes: (Node | string)[]): void;
    /**
     * Inserts nodes before the first child of node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     */
    prepend(...nodes: (Node | string)[]): void;
    /**
     * Returns the first element that is a descendant of node that matches selectors.
     */
    querySelector<E=Element>(selectors: string): E | null;
    /**
     * Returns all element descendants of node that match selectors.
     */
 
    querySelectorAll<E = Element>(selectors: string): NodeListOf<E>;
    /**
     * Replace all children of node with nodes, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     */
    replaceChildren(...nodes: (Node | string)[]): void;
}

/** Used by the dataset HTML attribute to represent data for custom attributes added to elements. */
declare class DOMStringMap {
    [name: string]: string;
}

declare interface HTMLOrSVGElement {
    autofocus: boolean;
    const dataset: DOMStringMap;
    nonce?: string;
    tabIndex: number;
    blur(): void;
    focus(options?: {preventScroll?: boolean}): void;
}

declare interface HTMLElement extends Element implements HTMLOrSVGElement,ElementContentEditable,DocumentAndElementEventHandlers,ElementCSSInlineStyle{
   
    const accessKeyLabel: string;
    const offsetHeight: number;
    const offsetLeft: number;
    const offsetParent: Element | null;
    const offsetTop: number;
    const offsetWidth: number;
    
    accessKey: string;
    autocapitalize: string;
    dir: string;
    draggable: boolean;
    hidden: boolean;
    innerText: string;
    lang: string;
    outerText: string;
    spellcheck: boolean;
    title: string;
    translate: boolean;
    click(): void;
}

declare interface ChildNode extends Node {
    /**
     * Inserts nodes just after node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     */
    after(...nodes: (Node | string)[]): void;
    /**
     * Inserts nodes just before node, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     */
    before(...nodes: (Node | string)[]): void;
    /**
     * Removes node.
     */
    remove(): void;
    /**
     * Replaces node with nodes, while replacing strings in nodes with equivalent Text nodes.
     *
     * Throws a "HierarchyRequestError" DOMException if the constraints of the node tree are violated.
     */
    replaceWith(...nodes: (Node | string)[]): void;
}

/** A DOM element's attribute as an object. In most DOM methods, you will probably directly retrieve the attribute as a string (e.g., Element.getAttribute(), but certain functions (e.g., Element.getAttributeNode()) or means of iterating give Attr types. */
declare interface Attr extends Node {
    get localName(): string;
    get name(): string;
    get namespaceURI(): string | null;
    get ownerElement(): Element | null;
    get prefix(): string | null;
    get specified(): boolean;
    get value():string;
    set value(val:string):void;
}

declare interface NamedNodeMap {
    const length: number;
    getNamedItem(qualifiedName: string): Attr | null;
    getNamedItemNS(namespace: string | null, localName: string): Attr | null;
    item(index: number): Attr | null;
    removeNamedItem(qualifiedName: string): Attr;
    removeNamedItemNS(namespace: string | null, localName: string): Attr;
    setNamedItem(attr: Attr): Attr | null;
    setNamedItemNS(attr: Attr): Attr | null;
}


/** A set of space-separated tokens. Such a set is returned by Element.classList, HTMLLinkElement.relList, HTMLAnchorElement.relList, HTMLAreaElement.relList, HTMLIframeElement.sandbox, or HTMLOutputElement.htmlFor. It is indexed beginning with 0 as with JavaScript Array objects. DOMTokenList is always case-sensitive. */
declare interface DOMTokenList {
    /**
     * Returns the number of tokens.
     */
    const length: number;
    /**
     * Returns the associated set as string.
     *
     * Can be set, to change the associated attribute.
     */
    var value: string;
    toString(): string;
    /**
     * Adds all arguments passed, except those already present.
     *
     * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
     *
     * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
     */
    add(...tokens: string[]): void;
    /**
     * Returns true if token is present, and false otherwise.
     */
    contains(token: string): boolean;
    /**
     * Returns the token with index index.
     */
    item(index: number): string | null;
    /**
     * Removes arguments passed, if they are present.
     *
     * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
     *
     * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
     */
    remove(...tokens: string[]): void;
    /**
     * Replaces token with newToken.
     *
     * Returns true if token was replaced with newToken, and false otherwise.
     *
     * Throws a "SyntaxError" DOMException if one of the arguments is the empty string.
     *
     * Throws an "InvalidCharacterError" DOMException if one of the arguments contains any ASCII whitespace.
     */
    replace(token: string, newToken: string): boolean;
    /**
     * Returns true if token is in the associated attribute's supported tokens. Returns false otherwise.
     *
     * Throws a TypeError if the associated attribute has no supported tokens defined.
     */
    supports(token: string): boolean;
    /**
     * If force is not given, "toggles" token, removing it if it's present and adding it if it's not present. If force is true, adds token (same as add()). If force is false, removes token (same as remove()).
     *
     * Returns true if token is now present, and false otherwise.
     *
     * Throws a "SyntaxError" DOMException if token is empty.
     *
     * Throws an "InvalidCharacterError" DOMException if token contains any spaces.
     */
    toggle(token: string, force?: boolean): boolean;
    forEach(callbackfn: (value: string, key: number, parent: DOMTokenList) => void, thisArg?: any): void;
}


/** An object that is a CSS declaration block, and exposes style information and various style-related methods and properties. */
declare interface CSSStyleDeclaration {
    const length: number;
    accentColor: string;
    alignContent: string;
    alignItems: string;
    alignSelf: string;
    alignmentBaseline: string;
    all: string;
    animation: string;
    animationDelay: string;
    animationDirection: string;
    animationDuration: string;
    animationFillMode: string;
    animationIterationCount: string;
    animationName: string;
    animationPlayState: string;
    animationTimingFunction: string;
    appearance: string;
    aspectRatio: string;
    backfaceVisibility: string;
    background: string;
    backgroundAttachment: string;
    backgroundBlendMode: string;
    backgroundClip: string;
    backgroundColor: string;
    backgroundImage: string;
    backgroundOrigin: string;
    backgroundPosition: string;
    backgroundPositionX: string;
    backgroundPositionY: string;
    backgroundRepeat: string;
    backgroundSize: string;
    baselineShift: string;
    blockSize: string;
    border: string;
    borderBlock: string;
    borderBlockColor: string;
    borderBlockEnd: string;
    borderBlockEndColor: string;
    borderBlockEndStyle: string;
    borderBlockEndWidth: string;
    borderBlockStart: string;
    borderBlockStartColor: string;
    borderBlockStartStyle: string;
    borderBlockStartWidth: string;
    borderBlockStyle: string;
    borderBlockWidth: string;
    borderBottom: string;
    borderBottomColor: string;
    borderBottomLeftRadius: string;
    borderBottomRightRadius: string;
    borderBottomStyle: string;
    borderBottomWidth: string;
    borderCollapse: string;
    borderColor: string;
    borderEndEndRadius: string;
    borderEndStartRadius: string;
    borderImage: string;
    borderImageOutset: string;
    borderImageRepeat: string;
    borderImageSlice: string;
    borderImageSource: string;
    borderImageWidth: string;
    borderInline: string;
    borderInlineColor: string;
    borderInlineEnd: string;
    borderInlineEndColor: string;
    borderInlineEndStyle: string;
    borderInlineEndWidth: string;
    borderInlineStart: string;
    borderInlineStartColor: string;
    borderInlineStartStyle: string;
    borderInlineStartWidth: string;
    borderInlineStyle: string;
    borderInlineWidth: string;
    borderLeft: string;
    borderLeftColor: string;
    borderLeftStyle: string;
    borderLeftWidth: string;
    borderRadius: string;
    borderRight: string;
    borderRightColor: string;
    borderRightStyle: string;
    borderRightWidth: string;
    borderSpacing: string;
    borderStartEndRadius: string;
    borderStartStartRadius: string;
    borderStyle: string;
    borderTop: string;
    borderTopColor: string;
    borderTopLeftRadius: string;
    borderTopRightRadius: string;
    borderTopStyle: string;
    borderTopWidth: string;
    borderWidth: string;
    bottom: string;
    boxShadow: string;
    boxSizing: string;
    breakAfter: string;
    breakBefore: string;
    breakInside: string;
    captionSide: string;
    caretColor: string;
    clear: string;
    /** @deprecated */
    clip: string;
    clipPath: string;
    clipRule: string;
    color: string;
    colorInterpolation: string;
    colorInterpolationFilters: string;
    colorScheme: string;
    columnCount: string;
    columnFill: string;
    columnGap: string;
    columnRule: string;
    columnRuleColor: string;
    columnRuleStyle: string;
    columnRuleWidth: string;
    columnSpan: string;
    columnWidth: string;
    columns: string;
    contain: string;
    content: string;
    contentVisibility: string;
    counterIncrement: string;
    counterReset: string;
    counterSet: string;
    cssFloat: string;
    cssText: string;
    cursor: string;
    direction: string;
    display: string;
    dominantBaseline: string;
    emptyCells: string;
    fill: string;
    fillOpacity: string;
    fillRule: string;
    filter: string;
    flex: string;
    flexBasis: string;
    flexDirection: string;
    flexFlow: string;
    flexGrow: string;
    flexShrink: string;
    flexWrap: string;
    float: string;
    floodColor: string;
    floodOpacity: string;
    font: string;
    fontFamily: string;
    fontFeatureSettings: string;
    fontKerning: string;
    fontOpticalSizing: string;
    fontSize: string;
    fontSizeAdjust: string;
    fontStretch: string;
    fontStyle: string;
    fontSynthesis: string;
    fontVariant: string;
    fontVariantAlternates: string;
    fontVariantCaps: string;
    fontVariantEastAsian: string;
    fontVariantLigatures: string;
    fontVariantNumeric: string;
    fontVariantPosition: string;
    fontVariationSettings: string;
    fontWeight: string;
    gap: string;
    grid: string;
    gridArea: string;
    gridAutoColumns: string;
    gridAutoFlow: string;
    gridAutoRows: string;
    gridColumn: string;
    gridColumnEnd: string;
    /** @deprecated This is a legacy alias of `columnGap`. */
    gridColumnGap: string;
    gridColumnStart: string;
    /** @deprecated This is a legacy alias of `gap`. */
    gridGap: string;
    gridRow: string;
    gridRowEnd: string;
    /** @deprecated This is a legacy alias of `rowGap`. */
    gridRowGap: string;
    gridRowStart: string;
    gridTemplate: string;
    gridTemplateAreas: string;
    gridTemplateColumns: string;
    gridTemplateRows: string;
    height: string;
    hyphens: string;
    /** @deprecated */
    imageOrientation: string;
    imageRendering: string;
    inlineSize: string;
    inset: string;
    insetBlock: string;
    insetBlockEnd: string;
    insetBlockStart: string;
    insetInline: string;
    insetInlineEnd: string;
    insetInlineStart: string;
    isolation: string;
    justifyContent: string;
    justifyItems: string;
    justifySelf: string;
    left: string;
    letterSpacing: string;
    lightingColor: string;
    lineBreak: string;
    lineHeight: string;
    listStyle: string;
    listStyleImage: string;
    listStylePosition: string;
    listStyleType: string;
    margin: string;
    marginBlock: string;
    marginBlockEnd: string;
    marginBlockStart: string;
    marginBottom: string;
    marginInline: string;
    marginInlineEnd: string;
    marginInlineStart: string;
    marginLeft: string;
    marginRight: string;
    marginTop: string;
    marker: string;
    markerEnd: string;
    markerMid: string;
    markerStart: string;
    mask: string;
    maskClip: string;
    maskComposite: string;
    maskImage: string;
    maskMode: string;
    maskOrigin: string;
    maskPosition: string;
    maskRepeat: string;
    maskSize: string;
    maskType: string;
    maxBlockSize: string;
    maxHeight: string;
    maxInlineSize: string;
    maxWidth: string;
    minBlockSize: string;
    minHeight: string;
    minInlineSize: string;
    minWidth: string;
    mixBlendMode: string;
    objectFit: string;
    objectPosition: string;
    offset: string;
    offsetDistance: string;
    offsetPath: string;
    offsetRotate: string;
    opacity: string;
    order: string;
    orphans: string;
    outline: string;
    outlineColor: string;
    outlineOffset: string;
    outlineStyle: string;
    outlineWidth: string;
    overflow: string;
    overflowAnchor: string;
    overflowWrap: string;
    overflowX: string;
    overflowY: string;
    overscrollBehavior: string;
    overscrollBehaviorBlock: string;
    overscrollBehaviorInline: string;
    overscrollBehaviorX: string;
    overscrollBehaviorY: string;
    padding: string;
    paddingBlock: string;
    paddingBlockEnd: string;
    paddingBlockStart: string;
    paddingBottom: string;
    paddingInline: string;
    paddingInlineEnd: string;
    paddingInlineStart: string;
    paddingLeft: string;
    paddingRight: string;
    paddingTop: string;
    pageBreakAfter: string;
    pageBreakBefore: string;
    pageBreakInside: string;
    paintOrder: string;
    const parentRule: CSSRule | null;
    perspective: string;
    perspectiveOrigin: string;
    placeContent: string;
    placeItems: string;
    placeSelf: string;
    pointerEvents: string;
    position: string;
    printColorAdjust: string;
    quotes: string;
    resize: string;
    right: string;
    rotate: string;
    rowGap: string;
    rubyPosition: string;
    scale: string;
    scrollBehavior: string;
    scrollMargin: string;
    scrollMarginBlock: string;
    scrollMarginBlockEnd: string;
    scrollMarginBlockStart: string;
    scrollMarginBottom: string;
    scrollMarginInline: string;
    scrollMarginInlineEnd: string;
    scrollMarginInlineStart: string;
    scrollMarginLeft: string;
    scrollMarginRight: string;
    scrollMarginTop: string;
    scrollPadding: string;
    scrollPaddingBlock: string;
    scrollPaddingBlockEnd: string;
    scrollPaddingBlockStart: string;
    scrollPaddingBottom: string;
    scrollPaddingInline: string;
    scrollPaddingInlineEnd: string;
    scrollPaddingInlineStart: string;
    scrollPaddingLeft: string;
    scrollPaddingRight: string;
    scrollPaddingTop: string;
    scrollSnapAlign: string;
    scrollSnapStop: string;
    scrollSnapType: string;
    scrollbarGutter: string;
    shapeImageThreshold: string;
    shapeMargin: string;
    shapeOutside: string;
    shapeRendering: string;
    stopColor: string;
    stopOpacity: string;
    stroke: string;
    strokeDasharray: string;
    strokeDashoffset: string;
    strokeLinecap: string;
    strokeLinejoin: string;
    strokeMiterlimit: string;
    strokeOpacity: string;
    strokeWidth: string;
    tabSize: string;
    tableLayout: string;
    textAlign: string;
    textAlignLast: string;
    textAnchor: string;
    textCombineUpright: string;
    textDecoration: string;
    textDecorationColor: string;
    textDecorationLine: string;
    textDecorationSkipInk: string;
    textDecorationStyle: string;
    textDecorationThickness: string;
    textEmphasis: string;
    textEmphasisColor: string;
    textEmphasisPosition: string;
    textEmphasisStyle: string;
    textIndent: string;
    textOrientation: string;
    textOverflow: string;
    textRendering: string;
    textShadow: string;
    textTransform: string;
    textUnderlineOffset: string;
    textUnderlinePosition: string;
    top: string;
    touchAction: string;
    transform: string;
    transformBox: string;
    transformOrigin: string;
    transformStyle: string;
    transition: string;
    transitionDelay: string;
    transitionDuration: string;
    transitionProperty: string;
    transitionTimingFunction: string;
    translate: string;
    unicodeBidi: string;
    userSelect: string;
    verticalAlign: string;
    visibility: string;
    /** @deprecated This is a legacy alias of `alignContent`. */
    webkitAlignContent: string;
    /** @deprecated This is a legacy alias of `alignItems`. */
    webkitAlignItems: string;
    /** @deprecated This is a legacy alias of `alignSelf`. */
    webkitAlignSelf: string;
    /** @deprecated This is a legacy alias of `animation`. */
    webkitAnimation: string;
    /** @deprecated This is a legacy alias of `animationDelay`. */
    webkitAnimationDelay: string;
    /** @deprecated This is a legacy alias of `animationDirection`. */
    webkitAnimationDirection: string;
    /** @deprecated This is a legacy alias of `animationDuration`. */
    webkitAnimationDuration: string;
    /** @deprecated This is a legacy alias of `animationFillMode`. */
    webkitAnimationFillMode: string;
    /** @deprecated This is a legacy alias of `animationIterationCount`. */
    webkitAnimationIterationCount: string;
    /** @deprecated This is a legacy alias of `animationName`. */
    webkitAnimationName: string;
    /** @deprecated This is a legacy alias of `animationPlayState`. */
    webkitAnimationPlayState: string;
    /** @deprecated This is a legacy alias of `animationTimingFunction`. */
    webkitAnimationTimingFunction: string;
    /** @deprecated This is a legacy alias of `appearance`. */
    webkitAppearance: string;
    /** @deprecated This is a legacy alias of `backfaceVisibility`. */
    webkitBackfaceVisibility: string;
    /** @deprecated This is a legacy alias of `backgroundClip`. */
    webkitBackgroundClip: string;
    /** @deprecated This is a legacy alias of `backgroundOrigin`. */
    webkitBackgroundOrigin: string;
    /** @deprecated This is a legacy alias of `backgroundSize`. */
    webkitBackgroundSize: string;
    /** @deprecated This is a legacy alias of `borderBottomLeftRadius`. */
    webkitBorderBottomLeftRadius: string;
    /** @deprecated This is a legacy alias of `borderBottomRightRadius`. */
    webkitBorderBottomRightRadius: string;
    /** @deprecated This is a legacy alias of `borderRadius`. */
    webkitBorderRadius: string;
    /** @deprecated This is a legacy alias of `borderTopLeftRadius`. */
    webkitBorderTopLeftRadius: string;
    /** @deprecated This is a legacy alias of `borderTopRightRadius`. */
    webkitBorderTopRightRadius: string;
    /** @deprecated This is a legacy alias of `boxAlign`. */
    webkitBoxAlign: string;
    /** @deprecated This is a legacy alias of `boxFlex`. */
    webkitBoxFlex: string;
    /** @deprecated This is a legacy alias of `boxOrdinalGroup`. */
    webkitBoxOrdinalGroup: string;
    /** @deprecated This is a legacy alias of `boxOrient`. */
    webkitBoxOrient: string;
    /** @deprecated This is a legacy alias of `boxPack`. */
    webkitBoxPack: string;
    /** @deprecated This is a legacy alias of `boxShadow`. */
    webkitBoxShadow: string;
    /** @deprecated This is a legacy alias of `boxSizing`. */
    webkitBoxSizing: string;
    /** @deprecated This is a legacy alias of `filter`. */
    webkitFilter: string;
    /** @deprecated This is a legacy alias of `flex`. */
    webkitFlex: string;
    /** @deprecated This is a legacy alias of `flexBasis`. */
    webkitFlexBasis: string;
    /** @deprecated This is a legacy alias of `flexDirection`. */
    webkitFlexDirection: string;
    /** @deprecated This is a legacy alias of `flexFlow`. */
    webkitFlexFlow: string;
    /** @deprecated This is a legacy alias of `flexGrow`. */
    webkitFlexGrow: string;
    /** @deprecated This is a legacy alias of `flexShrink`. */
    webkitFlexShrink: string;
    /** @deprecated This is a legacy alias of `flexWrap`. */
    webkitFlexWrap: string;
    /** @deprecated This is a legacy alias of `justifyContent`. */
    webkitJustifyContent: string;
    webkitLineClamp: string;
    /** @deprecated This is a legacy alias of `mask`. */
    webkitMask: string;
    /** @deprecated This is a legacy alias of `maskBorder`. */
    webkitMaskBoxImage: string;
    /** @deprecated This is a legacy alias of `maskBorderOutset`. */
    webkitMaskBoxImageOutset: string;
    /** @deprecated This is a legacy alias of `maskBorderRepeat`. */
    webkitMaskBoxImageRepeat: string;
    /** @deprecated This is a legacy alias of `maskBorderSlice`. */
    webkitMaskBoxImageSlice: string;
    /** @deprecated This is a legacy alias of `maskBorderSource`. */
    webkitMaskBoxImageSource: string;
    /** @deprecated This is a legacy alias of `maskBorderWidth`. */
    webkitMaskBoxImageWidth: string;
    /** @deprecated This is a legacy alias of `maskClip`. */
    webkitMaskClip: string;
    webkitMaskComposite: string;
    /** @deprecated This is a legacy alias of `maskImage`. */
    webkitMaskImage: string;
    /** @deprecated This is a legacy alias of `maskOrigin`. */
    webkitMaskOrigin: string;
    /** @deprecated This is a legacy alias of `maskPosition`. */
    webkitMaskPosition: string;
    /** @deprecated This is a legacy alias of `maskRepeat`. */
    webkitMaskRepeat: string;
    /** @deprecated This is a legacy alias of `maskSize`. */
    webkitMaskSize: string;
    /** @deprecated This is a legacy alias of `order`. */
    webkitOrder: string;
    /** @deprecated This is a legacy alias of `perspective`. */
    webkitPerspective: string;
    /** @deprecated This is a legacy alias of `perspectiveOrigin`. */
    webkitPerspectiveOrigin: string;
    webkitTextFillColor: string;
    webkitTextStroke: string;
    webkitTextStrokeColor: string;
    webkitTextStrokeWidth: string;
    /** @deprecated This is a legacy alias of `transform`. */
    webkitTransform: string;
    /** @deprecated This is a legacy alias of `transformOrigin`. */
    webkitTransformOrigin: string;
    /** @deprecated This is a legacy alias of `transformStyle`. */
    webkitTransformStyle: string;
    /** @deprecated This is a legacy alias of `transition`. */
    webkitTransition: string;
    /** @deprecated This is a legacy alias of `transitionDelay`. */
    webkitTransitionDelay: string;
    /** @deprecated This is a legacy alias of `transitionDuration`. */
    webkitTransitionDuration: string;
    /** @deprecated This is a legacy alias of `transitionProperty`. */
    webkitTransitionProperty: string;
    /** @deprecated This is a legacy alias of `transitionTimingFunction`. */
    webkitTransitionTimingFunction: string;
    /** @deprecated This is a legacy alias of `userSelect`. */
    webkitUserSelect: string;
    whiteSpace: string;
    widows: string;
    width: string;
    willChange: string;
    wordBreak: string;
    wordSpacing: string;
    /** @deprecated */
    wordWrap: string;
    writingMode: string;
    zIndex: string;
    getPropertyPriority(property: string): string;
    getPropertyValue(property: string): string;
    item(index: number): string;
    removeProperty(property: string): string;
    setProperty(property: string, value: string | null, priority?: string): void;
    [index: number]: string;
}

/** A CSSRuleList is an (indirect-modify only) array-like object containing an ordered collection of CSSRule objects. */
declare interface CSSRuleList {
    const length: number;
    item(index: number): CSSRule | null;
    [index: number]: CSSRule;
}

declare interface LinkStyle {
    const sheet: CSSStyleSheet | null;
}

/** A processing instruction embeds application-specific instructions in XML which can be ignored by other applications that don't recognize them. */
declare interface ProcessingInstruction extends LinkStyle {
    const ownerDocument: Document;
    const target: string;
}

/** A single style sheet. CSS style sheets will further implement the more specialized CSSStyleSheet interface. */
declare interface StyleSheet {
    disabled: boolean;
    const href: string | null;
    const media: MediaList;
    const ownerNode: Element | ProcessingInstruction | null;
    const parentStyleSheet: CSSStyleSheet | null;
    const title: string | null;
    const type: string;
}

declare interface MediaList {
    const length: number;
    mediaText: string;
    toString(): string;
    appendMedium(medium: string): void;
    deleteMedium(medium: string): void;
    item(index: number): string | null;
    [index: number]: string;
}

/** A single CSS style sheet. It inherits properties and methods from its parent, StyleSheet. */
declare interface CSSStyleSheet extends StyleSheet {
    const cssRules: CSSRuleList;
    const ownerRule: CSSRule | null;
    /** @deprecated */
    const rules: CSSRuleList;
    /** @deprecated */
    addRule(selector?: string, style?: string, index?: number): number;
    deleteRule(index: number): void;
    insertRule(rule: string, index?: number): number;
    /** @deprecated */
    removeRule(index?: number): void;
}

/** A single CSS rule. There are several types of rules, listed in the Type constants section below. */
declare interface CSSRule {
    cssText: string;
    const parentRule: CSSRule | null;
    const parentStyleSheet: CSSStyleSheet | null;
    /** @deprecated */
    const type: number;
    const CHARSET_RULE: number;
    const FONT_FACE_RULE: number;
    const IMPORT_RULE: number;
    const KEYFRAMES_RULE: number;
    const KEYFRAME_RULE: number;
    const MEDIA_RULE: number;
    const NAMESPACE_RULE: number;
    const PAGE_RULE: number;
    const STYLE_RULE: number;
    const SUPPORTS_RULE: number;
}

declare interface ElementCSSInlineStyle {
    const style: CSSStyleDeclaration;
}

declare type ShadowRootMode = "closed" | "open";

declare interface ShadowRoot {
    const delegatesFocus: boolean;
    const host: Element;
    const mode: ShadowRootMode;
}

declare type SlotAssignmentMode = "manual" | "named";

declare interface ShadowRootInit {
    var delegatesFocus?: boolean;
    var mode: ShadowRootMode;
    var slotAssignment?: SlotAssignmentMode;
}

declare interface DOMRectReadOnly {
    const bottom: number;
    const height: number;
    const left: number;
    const right: number;
    const top: number;
    const width: number;
    const x: number;
    const y: number;
    toJSON(): any;
}

declare interface DOMRect extends DOMRectReadOnly {
   var height: number;
   var width: number;
    var x: number;
    var y: number;
    fromRect(other?: DOMRect): DOMRect;
}

declare interface DOMRectList {
    const length: number;
    item(index: number): DOMRect | null;
}

declare interface HTMLCollectionOf<T extends Element> extends HTMLCollectionBase {
    namedItem(name: string): T | null;
}
declare type FullscreenNavigationUI = "auto" | "hide" | "show";
declare interface FullscreenOptions {
    var navigationUI?: FullscreenNavigationUI;
}

declare type InsertPosition = "beforebegin" | "afterbegin" | "beforeend" | "afterend";
declare type ScrollLogicalPosition = "center" | "end" | "nearest" | "start";
declare type ScrollBehavior = "auto" | "smooth";

declare interface ScrollIntoViewOptions extends ScrollOptions {
    var block?: ScrollLogicalPosition;
    var inline?: ScrollLogicalPosition;
}

declare interface ScrollOptions {
    var behavior?: ScrollBehavior;
}

declare interface ScrollToOptions extends ScrollOptions {
    var left?: number;
    var top?: number;
}

/** Element is the most general base class from which all objects in a Document inherit. It only has methods and properties common to all kinds of elements. More specific classes inherit from Element. */
declare interface Element extends Node implements ParentNode, ChildNode, GlobalEventHandlers{
    const attributes: NamedNodeMap;
    /**
     * Allows for manipulation of element's class content attribute as a set of whitespace-separated tokens through a DOMTokenList object.
     */
    const classList: DOMTokenList;
    /**
     * Returns the value of element's class content attribute. Can be set to change it.
     */
    var className: string;
    const clientHeight: number;
    const clientLeft: number;
    const clientTop: number;
    const clientWidth: number;
    /**
     * Returns the value of element's id content attribute. Can be set to change it.
     */
    var id: string;
    /**
     * Returns the local name.
     */
    const localName: string;
    /**
     * Returns the namespace.
     */
    const namespaceURI: string | null;
    const onfullscreenchange: (ev: Event) => any;
    const onfullscreenerror: (ev: Event) => any;
    var outerHTML: string;
    var innerHTML: string;
    const ownerDocument: Document;
    const part: DOMTokenList;
    /**
     * Returns the namespace prefix.
     */
    const prefix: string | null;
    const scrollHeight: number;

    var scrollLeft: number;
    var scrollTop: number;

    const scrollWidth: number;
    /**
     * Returns element's shadow root, if any, and if shadow root's mode is "open", and null otherwise.
     */
    const shadowRoot: ShadowRoot | null;
    /**
     * Returns the value of element's slot content attribute. Can be set to change it.
     */
    var slot: string;
    /**
     * Returns the HTML-uppercased qualified name.
     */
    const tagName: string;
    /**
     * Creates a shadow root for element and returns it.
     */
    attachShadow(init: ShadowRootInit): ShadowRoot;
    /**
     * Returns the first (starting at element) inclusive ancestor that matches selectors, and null otherwise.
     */
    closest<K>(selector: K): any;
    /**
     * Returns element's first attribute whose qualified name is qualifiedName, and null if there is no such attribute otherwise.
     */
    getAttribute(qualifiedName: string): string | null;
    /**
     * Returns element's attribute whose namespace is namespace and local name is localName, and null if there is no such attribute otherwise.
     */
    getAttributeNS(namespace: string | null, localName: string): string | null;
    /**
     * Returns the qualified names of all element's attributes. Can contain duplicates.
     */
    getAttributeNames(): string[];
    getAttributeNode(qualifiedName: string): Attr | null;
    getAttributeNodeNS(namespace: string | null, localName: string): Attr | null;
    getBoundingClientRect(): DOMRect;
    getClientRects(): DOMRectList;
    /**
     * Returns a HTMLCollection of the elements in the object on which the method was invoked (a document or an element) that have all the classes given by classNames. The classNames argument is interpreted as a space-separated list of classes.
     */
    getElementsByClassName(classNames: string): HTMLCollectionOf<Element>;
    getElementsByTagName<K>(qualifiedName: K): HTMLCollectionOf<Element>;
    getElementsByTagNameNS(namespace: string | null, localName: string): HTMLCollectionOf<Element>;
    /**
     * Returns true if element has an attribute whose qualified name is qualifiedName, and false otherwise.
     */
    hasAttribute(qualifiedName: string): boolean;
    /**
     * Returns true if element has an attribute whose namespace is namespace and local name is localName.
     */
    hasAttributeNS(namespace: string | null, localName: string): boolean;
    /**
     * Returns true if element has attributes, and false otherwise.
     */
    hasAttributes(): boolean;
    hasPointerCapture(pointerId: number): boolean;
    insertAdjacentElement(where: InsertPosition, element: Element): Element | null;
    insertAdjacentHTML(position: InsertPosition, text: string): void;
    insertAdjacentText(where: InsertPosition, data: string): void;
    /**
     * Returns true if matching selectors against element's root yields element, and false otherwise.
     */
    matches(selectors: string): boolean;
    releasePointerCapture(pointerId: number): void;
    /**
     * Removes element's first attribute whose qualified name is qualifiedName.
     */
    removeAttribute(qualifiedName: string): void;
    /**
     * Removes element's attribute whose namespace is namespace and local name is localName.
     */
    removeAttributeNS(namespace: string | null, localName: string): void;
    removeAttributeNode(attr: Attr): Attr;
    /**
     * Displays element fullscreen and resolves promise when done.
     *
     * When supplied, options's navigationUI member indicates whether showing navigation UI while in fullscreen is preferred or not. If set to "show", navigation simplicity is preferred over screen space, and if set to "hide", more screen space is preferred. User agents are always free to honor user preference over the application's. The default value "auto" indicates no application preference.
     */
    requestFullscreen(options?: FullscreenOptions): Promise<void>;
    requestPointerLock(): void;
    scroll(x: number, y: number): void;
    scrollBy(x: number, y: number): void;
    scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
    scrollTo(x: number, y: number): void;
    /**
     * Sets the value of element's first attribute whose qualified name is qualifiedName to value.
     */
    setAttribute(qualifiedName: string, value: string): void;
    /**
     * Sets the value of element's attribute whose namespace is namespace and local name is localName to value.
     */
    setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void;
    setAttributeNode(attr: Attr): Attr | null;
    setAttributeNodeNS(attr: Attr): Attr | null;
    setPointerCapture(pointerId: number): void;
    /**
     * If force is not given, "toggles" qualifiedName, removing it if it is present and adding it if it is not present. If force is true, adds qualifiedName. If force is false, removes qualifiedName.
     *
     * Returns true if qualifiedName is now present, and false otherwise.
     */
    toggleAttribute(qualifiedName: string, force?: boolean): boolean;
    /** @deprecated This is a legacy alias of `matches`. */
    webkitMatchesSelector(selectors: string): boolean;
}


/** The location (URL) of the object it is linked to. Changes done on it are reflected on the object it relates to. Both the Document and Window interface have such a linked Location, accessible via Document.location and Window.location respectively. */
declare interface Location {
    /**
     * Returns a DOMStringList object listing the origins of the ancestor browsing contexts, from the parent browsing context to the top-level browsing context.
     */
    const ancestorOrigins: any;
    /**
     * Returns the Location object's URL's fragment (includes leading "#" if non-empty).
     *
     * Can be set, to navigate to the same URL with a changed fragment (ignores leading "#").
     */
    var hash: string;
    /**
     * Returns the Location object's URL's host and port (if different from the default port for the scheme).
     *
     * Can be set, to navigate to the same URL with a changed host and port.
     */
    var host: string;
    /**
     * Returns the Location object's URL's host.
     *
     * Can be set, to navigate to the same URL with a changed host.
     */
    var hostname: string;
    /**
     * Returns the Location object's URL.
     *
     * Can be set, to navigate to the given URL.
     */
    var href: string;
    /**
     * Returns the Location object's URL's origin.
     */
    const origin: string;
    /**
     * Returns the Location object's URL's path.
     *
     * Can be set, to navigate to the same URL with a changed path.
     */
    var pathname: string;
    /**
     * Returns the Location object's URL's port.
     *
     * Can be set, to navigate to the same URL with a changed port.
     */
    var port: string;
    /**
     * Returns the Location object's URL's scheme.
     *
     * Can be set, to navigate to the same URL with a changed scheme.
     */
    var protocol: string;
    /**
     * Returns the Location object's URL's query (includes leading "?" if non-empty).
     *
     * Can be set, to navigate to the same URL with a changed query (ignores leading "?").
     */
    var search: string;
    /**
     * Navigates to the given URL.
     */
    assign(url: string): void;
    /**
     * Reloads the current page.
     */
    reload(): void;
    /**
     * Removes the current page from the session history and navigates to the given URL.
     */
    replace(url: string): void;
    toString(): string;
}

declare const location:Location;

declare interface ClipboardItemOptions {
    presentationStyle?: "attachment" | "inline" | "unspecified";
}

/** Available only in secure contexts. */
declare class ClipboardItem {
    const types: Array<string>;
    constructor(items:  string | Blob | Promise<string | Blob>, options?: ClipboardItemOptions): ClipboardItem;
    getType(type: string): Promise<Blob>;
}

/** Available only in secure contexts. */
declare class Clipboard extends EventDispatcher {
    read(): Promise<ClipboardItem[]>;
    readText(): Promise<string>;
    write(data: ClipboardItem[]): Promise<void>;
    writeText(data: string): Promise<void>;
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



/** Simple user interface events. */
declare class UIEvent extends Event {
    const detail: number;
    const view: Window | null;
    constructor(type:string, bubbles?:boolean,cancelable?:boolean);
}

/** Events that occur due to the user interacting with a pointing device (such as a mouse). Common events using this interface include click, dblclick, mouseup, mousedown. */
declare class MouseEvent extends UIEvent {

    static const MOUSE_DOWN:string='mousedown';
    static const MOUSE_UP:string='mouseup';
    static const MOUSE_OVER:string='mouseover';
    static const MOUSE_OUT:string='mouseout';
    static const MOUSE_OUTSIDE:string='mouseoutside';
    static const MOUSE_MOVE:string='mousemove';
    static const MOUSE_WHEEL:string='mousewheel';
    static const CLICK:string='click';
    static const DBLCLICK:string='dblclick';

    const altKey: boolean;
    const wheelDelta: number;
    const button: number;
    const buttons: number;
    const clientX: number;
    const clientY: number;
    const ctrlKey: boolean;
    const metaKey: boolean;
    const movementX: number;
    const movementY: number;
    const offsetX: number;
    const offsetY: number;
    const pageX: number;
    const pageY: number;
    const relatedTarget: EventDispatcher | null;
    const screenX: number;
    const screenY: number;
    const shiftKey: boolean;
    const x: number;
    const y: number;

    constructor(type:string, bubbles?:boolean,cancelable?:boolean);
    getModifierState(keyArg: string): boolean;
    initMouseEvent(typeArg: string, 
                    canBubbleArg: boolean, 
                    cancelableArg: boolean, 
                    viewArg: Window, 
                    detailArg: number, 
                    screenXArg: number, 
                    screenYArg: number, 
                    clientXArg: number, 
                    clientYArg: number, 
                    ctrlKeyArg: boolean, 
                    altKeyArg: boolean, 
                    shiftKeyArg: boolean, 
                    metaKeyArg: boolean, 
                    buttonArg: number, 
                    relatedTargetArg: EventDispatcher | null): void; 
}

/** 
* KeyboardEvent objects describe a user interaction with the keyboard; 
* each event describes a single interaction between the user and a key (or combination of a key with modifier keys) 
* on the keyboard. 
*/
declare class KeyboardEvent extends UIEvent{
    const altKey: boolean;
    const code: string;
    const ctrlKey: boolean;
    const isComposing: boolean;
    const key: string;
    const location: number;
    const metaKey: boolean;
    const repeat: boolean;
    const shiftKey: boolean;
    const DOM_KEY_LOCATION_LEFT: number;
    const DOM_KEY_LOCATION_NUMPAD: number;
    const DOM_KEY_LOCATION_RIGHT: number;
    const DOM_KEY_LOCATION_STANDARD: number;
    constructor(type:string, bubbles?:boolean,cancelable?:boolean);
    getModifierState(keyArg: string): boolean;
}

declare class Touch extends Object{
    const altitudeAngle: number;
    const azimuthAngle: number;
    const clientX: number;
    const clientY: number;
    const force: number;
    const identifier: number;
    const pageX: number;
    const pageY: number;
    const radiusX: number;
    const radiusY: number;
    const rotationAngle: number;
    const screenX: number;
    const screenY: number;
    const target: EventDispatcher;
    const touchType: "direct" | "stylus";
}

declare interface TouchList {
    const length: number;
    item(index: number):Touch;
}

declare class TouchEvent extends UIEvent {
    const altKey: boolean;
    const changedTouches: TouchList;
    const ctrlKey: boolean;
    const metaKey: boolean;
    const shiftKey: boolean;
    const targetTouches: TouchList;
    const touches: TouchList;
    constructor(type:string, bubbles?:boolean,cancelable?:boolean);
}

declare interface DataTransfer extends Object{
    [key:string]:any
}

/** A DOM event that represents a drag and drop interaction. 
The user initiates a drag by placing a pointer device (such as a mouse) on the touch surface and then dragging 
the pointer to a new location (such as another DOM element). Applications are free to interpret a drag and 
drop interaction in an application-specific way.
 */
declare class DragEvent extends MouseEvent {
    /**
     * Returns the DataTransfer object for the event.
     */
    const dataTransfer: DataTransfer | null;

    constructor(type:string, bubbles?:boolean,cancelable?:boolean);
}


/** Events providing information related to animations. */
declare class AnimationEvent extends Event {
    const animationName: string;
    const elapsedTime: number;
    const pseudoElement: string;
}

/** Focus-related events like focus, blur, focusin, or focusout. */
declare  class FocusEvent extends UIEvent {
    const relatedTarget: IEventDispatcher;
}

declare class FormDataEvent extends Event {
    /** Returns a FormData object representing names and values of elements associated to the target form. Operations on the FormData object will affect form data to be submitted. */
    const formData: FormData;
}

/** The state of a DOM event produced by a pointer such as the geometry of the contact point, the device type that generated the event, the amount of pressure that was applied on the contact surface, etc. */
declare class PointerEvent extends MouseEvent {
    const height: number;
    const isPrimary: boolean;
    const pointerId: number;
    const pointerType: string;
    const pressure: number;
    const tangentialPressure: number;
    const tiltX: number;
    const tiltY: number;
    const twist: number;
    const width: number;
    /** Available only in secure contexts. */
    getCoalescedEvents(): PointerEvent[];
    getPredictedEvents(): PointerEvent[];
}

/** Events measuring progress of an underlying process, like an HTTP request (for an XMLHttpRequest, or the loading of the underlying resource of an <img>, <audio>, <video>, <style> or <link>). */
declare class ProgressEvent<T extends IEventDispatcher> extends Event {
    const lengthComputable: boolean;
    const loaded: number;
    const target: T | null;
    const total: number;
}

declare class  SubmitEvent extends Event {
    /** Returns the element representing the submit button that triggered the form submission, or null if the submission was not triggered by a button. */
    const submitter: HTMLElement | null;
}

/** Available only in secure contexts. */
declare interface DeviceMotionEventAcceleration {
    const x: number;
    const y: number;
    const z: number;
}

/** Available only in secure contexts. */
declare interface DeviceMotionEventRotationRate {
    const alpha: number;
    const beta: number;
    const gamma: number;
}

/**
 * The DeviceMotionEvent provides web developers with information about the speed of changes for the device's position and orientation.
 * Available only in secure contexts.
 */
declare class DeviceMotionEvent extends Event {
    const acceleration: DeviceMotionEventAcceleration | null;
    const accelerationIncludingGravity: DeviceMotionEventAcceleration | null;
    const interval: number;
    const rotationRate: DeviceMotionEventRotationRate | null;
}

/** This Web Speech API interface contains information about the current state of SpeechSynthesisUtterance objects that have been processed in the speech service. */
declare class SpeechSynthesisEvent extends Event {
    const charIndex: number;
    const charLength: number;
    const elapsedTime: number;
    const name: string;
    const utterance: SpeechSynthesisUtterance;
}

declare class SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
    const error: "audio-busy" | "audio-hardware" | "canceled" | "interrupted" | "invalid-argument" | "language-unavailable" | "network" | "not-allowed" | "synthesis-failed" | "synthesis-unavailable" | "text-too-long" | "voice-unavailable";
}

/**
 * The DeviceOrientationEvent provides web developers with information from the physical orientation of the device running the web page.
 * Available only in secure contexts.
 */
declare class DeviceOrientationEvent extends Event {
    const absolute: boolean;
    const alpha: number | null;
    const beta: number | null;
    const gamma: number | null;
}


/** Inherits from Event, and represents the event object of an event sent on a document or worker when its content security policy is violated. */
declare class SecurityPolicyViolationEvent extends Event {
    const blockedURI: string;
    const columnNumber: number;
    const disposition: "enforce" | "report";
    const documentURI: string;
    const effectiveDirective: string;
    const lineNumber: number;
    const originalPolicy: string;
    const referrer: string;
    const sample: string;
    const sourceFile: string;
    const statusCode: number;
    const violatedDirective: string;
}

/** Events providing information related to transitions. */
declare class TransitionEvent extends Event {
    const elapsedTime: number;
    const propertyName: string;
    const pseudoElement: string;
}


/** Events that occur due to the user moving a mouse wheel or similar input device. */
declare class WheelEvent extends MouseEvent {
    const deltaMode: number;
    const deltaX: number;
    const deltaY: number;
    const deltaZ: number;
    static const DOM_DELTA_LINE: number;
    static const DOM_DELTA_PAGE: number;
    static const DOM_DELTA_PIXEL: number;
}

declare class MediaQueryListEvent extends Event {
    const matches: boolean;
    const media: string;
}

/** A message received by a target object. */
declare class MessageEvent<T = any> extends Event {
    /** Returns the data of the message. */
    const data: T;
    /** Returns the last event ID string, for server-sent events. */
    const lastEventId: string;
    /** Returns the origin of the message, for server-sent events and cross-document messaging. */
    const origin: string;
    /** Returns the MessagePort array sent with the message, for cross-document messaging and channel messaging. */
    const ports: Array<MessagePort>;
    /** Returns the WindowProxy of the source window, for cross-document messaging, and the MessagePort being attached, in the connect event fired at SharedWorkerGlobalScope objects. */
    const source: any;
}


/** Events providing information related to modification of the clipboard, that is cut, copy, and paste events. */
declare class ClipboardEvent extends Event {
    const clipboardData: DataTransfer | null;
}


/** A CloseEvent is sent to clients using WebSockets when the connection is closed. This is delivered to the listener indicated by the WebSocket object's onclose attribute. */
declare class CloseEvent extends Event {
    /** Returns the WebSocket connection close code provided by the server. */
    const code: number;
    /** Returns the WebSocket connection close reason provided by the server. */
    const reason: string;
    /** Returns true if the connection closed cleanly; false otherwise. */
    const wasClean: boolean;
}


declare interface GlobalEventHandlers {
    /**
     * Fires when the user aborts the download.
     * @param ev The event.
     */
    onabort: (ev: UIEvent) => any;
    onanimationcancel: (ev: AnimationEvent) => any;
    onanimationend: (ev: AnimationEvent) => any;
    onanimationiteration: (ev: AnimationEvent) => any;
    onanimationstart: (ev: AnimationEvent) => any;
    onauxclick: (ev: MouseEvent) => any;
    /**
     * Fires when the object loses the input focus.
     * @param ev The focus event.
     */
    onblur: (ev: FocusEvent) => any;
    /**
     * Occurs when playback is possible, but would require further buffering.
     * @param ev The event.
     */
    oncanplay: (ev: Event) => any;
    oncanplaythrough: (ev: Event) => any;
    /**
     * Fires when the contents of the object or selection have changed.
     * @param ev The event.
     */
    onchange: (ev: Event) => any;
    /**
     * Fires when the user clicks the left mouse button on the object
     * @param ev The mouse event.
     */
    onclick: (ev: MouseEvent) => any;
    onclose: (ev: Event) => any;
    /**
     * Fires when the user clicks the right mouse button in the client area, opening the context menu.
     * @param ev The mouse event.
     */
    oncontextmenu: (ev: MouseEvent) => any;
    oncuechange: (ev: Event) => any;
    /**
     * Fires when the user double-clicks the object.
     * @param ev The mouse event.
     */
    ondblclick: (ev: MouseEvent) => any;
    /**
     * Fires on the source object continuously during a drag operation.
     * @param ev The event.
     */
    ondrag: (ev: DragEvent) => any;
    /**
     * Fires on the source object when the user releases the mouse at the close of a drag operation.
     * @param ev The event.
     */
    ondragend: (ev: DragEvent) => any;
    /**
     * Fires on the target element when the user drags the object to a valid drop target.
     * @param ev The drag event.
     */
    ondragenter: (ev: DragEvent) => any;
    /**
     * Fires on the target object when the user moves the mouse out of a valid drop target during a drag operation.
     * @param ev The drag event.
     */
    ondragleave: (ev: DragEvent) => any;
    /**
     * Fires on the target element continuously while the user drags the object over a valid drop target.
     * @param ev The event.
     */
    ondragover: (ev: DragEvent) => any;
    /**
     * Fires on the source object when the user starts to drag a text selection or selected object.
     * @param ev The event.
     */
    ondragstart: (ev: DragEvent) => any;
    ondrop: (ev: DragEvent) => any;
    /**
     * Occurs when the duration attribute is updated.
     * @param ev The event.
     */
    ondurationchange: (ev: Event) => any;
    /**
     * Occurs when the media element is reset to its initial state.
     * @param ev The event.
     */
    onemptied: (ev: Event) => any;
    /**
     * Occurs when the end of playback is reached.
     * @param ev The event
     */
    onended: (ev: Event) => any;
    /**
     * Fires when an error occurs during object loading.
     * @param ev The event.
     */
    onerror:(event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error)=>void;
    /**
     * Fires when the object receives focus.
     * @param ev The event.
     */
    onfocus: (ev: FocusEvent) => any;
    onformdata: (ev: FormDataEvent) => any;
    ongotpointercapture: (ev: PointerEvent) => any;
    oninput: (ev: Event) => any;
    oninvalid: (ev: Event) => any;
    /**
     * Fires when the user presses a key.
     * @param ev The keyboard event
     */
    onkeydown: (ev: KeyboardEvent) => any;
    /**
     * Fires when the user presses an alphanumeric key.
     * @param ev The event.
     * @deprecated
     */
    onkeypress: (ev: KeyboardEvent) => any;
    /**
     * Fires when the user releases a key.
     * @param ev The keyboard event
     */
    onkeyup: (ev: KeyboardEvent) => any;
    /**
     * Fires immediately after the browser loads the object.
     * @param ev The event.
     */
    onload: (ev: Event) => any;
    /**
     * Occurs when media data is loaded at the current playback position.
     * @param ev The event.
     */
    onloadeddata: (ev: Event) => any;
    /**
     * Occurs when the duration and dimensions of the media have been determined.
     * @param ev The event.
     */
    onloadedmetadata: (ev: Event) => any;
    /**
     * Occurs when Internet Explorer begins looking for media data.
     * @param ev The event.
     */
    onloadstart: (ev: Event) => any;
    onlostpointercapture: (ev: PointerEvent) => any;
    /**
     * Fires when the user clicks the object with either mouse button.
     * @param ev The mouse event.
     */
    onmousedown: (ev: MouseEvent) => any;
    onmouseenter: (ev: MouseEvent) => any;
    onmouseleave: (ev: MouseEvent) => any;
    /**
     * Fires when the user moves the mouse over the object.
     * @param ev The mouse event.
     */
    onmousemove: (ev: MouseEvent) => any;
    /**
     * Fires when the user moves the mouse pointer outside the boundaries of the object.
     * @param ev The mouse event.
     */
    onmouseout: (ev: MouseEvent) => any;
    /**
     * Fires when the user moves the mouse pointer into the object.
     * @param ev The mouse event.
     */
    onmouseover: (ev: MouseEvent) => any;
    /**
     * Fires when the user releases a mouse button while the mouse is over the object.
     * @param ev The mouse event.
     */
    onmouseup: (ev: MouseEvent) => any;
    /**
     * Occurs when playback is paused.
     * @param ev The event.
     */
    onpause: (ev: Event) => any;
    /**
     * Occurs when the play method is requested.
     * @param ev The event.
     */
    onplay: (ev: Event) => any;
    /**
     * Occurs when the audio or video has started playing.
     * @param ev The event.
     */
    onplaying: (ev: Event) => any;
    onpointercancel: (ev: PointerEvent) => any;
    onpointerdown: (ev: PointerEvent) => any;
    onpointerenter: (ev: PointerEvent) => any;
    onpointerleave: (ev: PointerEvent) => any;
    onpointermove: (ev: PointerEvent) => any;
    onpointerout: (ev: PointerEvent) => any;
    onpointerover: (ev: PointerEvent) => any;
    onpointerup: (ev: PointerEvent) => any;

    /**
     * Occurs to indicate progress while downloading media data.
     * @param ev The event.
     */
    onprogress: (ev: ProgressEvent<IEventDispatcher>) => any;

    /**
     * Occurs when the playback rate is increased or decreased.
     * @param ev The event.
     */
    onratechange: (ev: Event) => any;
    /**
     * Fires when the user resets a form.
     * @param ev The event.
     */
    onreset: (ev: Event) => any;
    onresize: (ev: UIEvent) => any;
    /**
     * Fires when the user repositions the scroll box in the scroll bar on the object.
     * @param ev The event.
     */
    onscroll: (ev: Event) => any;
    onsecuritypolicyviolation: (ev: SecurityPolicyViolationEvent) => any;
    /**
     * Occurs when the seek operation ends.
     * @param ev The event.
     */
    onseeked: (ev: Event) => any;
    /**
     * Occurs when the current playback position is moved.
     * @param ev The event.
     */
    onseeking: (ev: Event) => any;
    /**
     * Fires when the current selection changes.
     * @param ev The event.
     */
    onselect: (ev: Event) => any;
    onselectionchange: (ev: Event) => any;
    onselectstart: (ev: Event) => any;
    onslotchange: (ev: Event) => any;
    /**
     * Occurs when the download has stopped.
     * @param ev The event.
     */
    onstalled: (ev: Event) => any;
    onsubmit: (ev: SubmitEvent) => any;
    /**
     * Occurs if the load operation has been intentionally halted.
     * @param ev The event.
     */
    onsuspend: (ev: Event) => any;
    /**
     * Occurs to indicate the current playback position.
     * @param ev The event.
     */
    ontimeupdate: (ev: Event) => any;
    ontoggle: (ev: Event) => any;
    ontouchcancel?: (ev: TouchEvent) => any;
    ontouchend?: (ev: TouchEvent) => any;
    ontouchmove?: (ev: TouchEvent) => any;
    ontouchstart?: (ev: TouchEvent) => any;
    ontransitioncancel: (ev: TransitionEvent) => any;
    ontransitionend: (ev: TransitionEvent) => any;
    ontransitionrun: (ev: TransitionEvent) => any;
    ontransitionstart: (ev: TransitionEvent) => any;
    /**
     * Occurs when the volume is changed, or playback is muted or unmuted.
     * @param ev The event.
     */
    onvolumechange: (ev: Event) => any;
    /**
     * Occurs when playback stops because the next frame of a video resource is not available.
     * @param ev The event.
     */
    onwaiting: (ev: Event) => any;
    /** @deprecated This is a legacy alias of `onanimationend`. */
    onwebkitanimationend: (ev: Event) => any;
    /** @deprecated This is a legacy alias of `onanimationiteration`. */
    onwebkitanimationiteration: (ev: Event) => any;
    /** @deprecated This is a legacy alias of `onanimationstart`. */
    onwebkitanimationstart: (ev: Event) => any;
    /** @deprecated This is a legacy alias of `ontransitionend`. */
    onwebkittransitionend: (ev: Event) => any;
    onwheel: (ev: WheelEvent) => any;
    
}