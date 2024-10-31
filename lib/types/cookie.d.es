package web;

declare interface CookieAttributes {

    /**
    * Define when the cookie will be removed. Value can be a Number
    * which will be interpreted as days from time of creation or a
    * Date instance. If omitted, the cookie becomes a session cookie.
    */
    expires?: number | Date;

    /**
    * Define the path where the cookie is available. Defaults to '/'
    */
    path?: string;

    /**
    * Define the domain where the cookie is available. Defaults to
    * the domain of the page where the cookie was created.
    */
    domain?: string;

    /**
    * A Boolean indicating if the cookie transmission requires a
    * secure protocol (https). Defaults to false.
    */
    secure?: boolean;

    /**
    * Asserts that a cookie must not be sent with cross-origin requests,
    * providing some protection against cross-site request forgery
    * attacks (CSRF)
    */
    sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';

    /**
    * An attribute which will be serialized, conformably to RFC 6265
    * section 5.2.
    */
    [property: string]: any;
}

declare interface CookieConverter<T>{
    write?:(value: string | T, name: string) => string
    read?: (value: string, name: string) => string | T
}

import Cookie from 'js-cookie';
declare static class Cookie<T=string> {

    const attributes: CookieAttributes;

    const converter: CookieConverter<string>;

    /**
    * Create a cookie
    */
    set(name: string, value: string | T, options?: CookieAttributes): string;

    /**
    * Read cookie
    */
    get(name?: string): string | T;

    /**
    * Delete cookie
    */
    remove(name: string, options?: CookieAttributes): void;

    /**
    * Cookie attribute defaults can be set globally by creating an
    * instance of the api via withAttributes(), or individually for
    * each call to Cookies.set(...) by passing a plain object as the
    * last argument. Per-call attributes override the default attributes.
    */
    withAttributes(attributes: CookieAttributes): Cookie<T>;

    /**
    * Create a new instance of the api that overrides the default
    * decoding implementation. All methods that rely in a proper
    * decoding to work, such as Cookies.remove() and Cookies.get(),
    * will run the converter first for each cookie. The returned
    * string will be used as the cookie value.
    */
    withConverter<TConv = string>(converter:CookieConverter<TConv>): Cookie<TConv>;

}