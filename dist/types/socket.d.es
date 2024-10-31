package net{

    /** Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection. */
    declare class WebSocket implements IEventDispatcher {

        static const CLOSED: number;
        static const CLOSING: number;
        static const CONNECTING: number;
        static const OPEN: number;

        constructor(url:string, protocols?: string | string[]);
        
        /**
        * Returns a string that indicates how binary data from the WebSocket object is exposed to scripts:
        *
        * Can be set, to change how binary data is returned. The default is "blob".
        */
        binaryType: Blob;
        /**
        * Returns the number of bytes of application data (UTF-8 text and binary data) that have been queued using send() but not yet been transmitted to the network.
        *
        * If the WebSocket connection is closed, this attribute's value will only increase with each call to the send() method. (The number does not reset to zero once the connection closes.)
        */
        const bufferedAmount: number;
        /** Returns the extensions selected by the server, if any. */
        const extensions: string;
        onclose: ((ev: CloseEvent) => any) | null;
        onerror: ((ev: Event) => any) | null;
        onmessage: ((ev: MessageEvent) => any) | null;
        onopen: ((ev: Event) => any) | null;
        /** Returns the subprotocol selected by the server, if any. It can be used in conjunction with the array form of the constructor's second argument to perform subprotocol negotiation. */
        const protocol: string;
        /** Returns the state of the WebSocket object's connection. It can have the values described below. */
        const readyState: number;
        /** Returns the URL that was used to establish the WebSocket connection. */
        const url: string;
        /** Closes the WebSocket connection, optionally using code as the the WebSocket connection close code and reason as the the WebSocket connection close reason. */
        close(code?: number, reason?: string): void;
        /** Transmits data using the WebSocket connection. data can be a string, a Blob, an ArrayBuffer, or an ArrayBufferView. */
        send(data: string | Blob | ArrayBufferView): void;
        
    }

}