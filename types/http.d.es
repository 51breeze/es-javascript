package net{
    
    declare interface HttpBasicCredentials {
        username: string;
        password: string;
    }

    declare interface HttpProxyConfig {
        host: string;
        port: number;
        auth?:HttpBasicCredentials
    }

    declare interface HttpResponse<T = any>  {
        data: T;
        status: number;
        statusText: string;
        headers: any;
        config: HttpConfig;
        request?: any;
    }

    declare interface HttpPromise<T = any> extends Promise< HttpResponse<T> > {}

    declare interface HttpInterceptorManager<V> {
        use(onFulfilled?: (value: V) => V | Promise<V>, onRejected?: (error: any) => any): number;
        eject(id: number): void;
    }

    declare class HttpAdapter {
        constructor(config: HttpConfig): HttpPromise<any>;
    }

    declare class HttpTransformer {
        @Callable
        constructor(data: any, headers?: any): any;
    }

    declare interface HttpCancelToken {
        promise: Promise<HttpCancel>;
        reason?: HttpCancel;
        throwIfRequested(): void;
    }

    declare class HttpCancelStatic {
        @Callable
        constructor(message?: string): HttpCancel;
    }

    declare interface HttpCancel {
        message: string;
    }

    declare class HttpCanceler {
        @Callable
        constructor(message?: string): void;
    }

    declare class HttpCancelTokenStatic {
        constructor(executor: (cancel: HttpCanceler) => void): HttpCancelToken;
        source(): HttpCancelTokenSource;
    }

    declare interface HttpCancelTokenSource {
        token: HttpCancelToken;
        cancel: HttpCanceler;
    }

    declare interface HttpConfig {
        url?: string;
        method?: string;
        baseURL?: string;
        transformRequest?: HttpTransformer | HttpTransformer[];
        transformResponse?: HttpTransformer | HttpTransformer[];
        headers?: any;
        params?: any;
        paramsSerializer?: (params: any) => string;
        data?: any;
        timeout?: number;
        withCredentials?: boolean;
        adapter?: HttpAdapter;
        auth?: HttpBasicCredentials;
        responseType?: string;
        xsrfCookieName?: string;
        xsrfHeaderName?: string;
        onUploadProgress?: (progressEvent: any) => void;
        onDownloadProgress?: (progressEvent: any) => void;
        maxContentLength?: number;
        validateStatus?: (status: number) => boolean;
        maxRedirects?: number;
        httpAgent?: any;
        httpsAgent?: any;
        proxy?: HttpProxyConfig | false;
        cancelToken?: HttpCancelToken;
    }

    @Require(Http='axios');
    declare class Http{

        static create(config?:HttpConfig):Http;
        static isCancel(value: any): boolean;
        static all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
        static spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
        static const Cancel: HttpCancelStatic;
        static const CancelToken: HttpCancelTokenStatic;

        constructor(url: string | HttpConfig, config?: HttpConfig): HttpPromise;
        defaults: HttpConfig;
        interceptors: {
            request: HttpInterceptorManager<HttpConfig>,
            response: HttpInterceptorManager<HttpResponse>
        };

        request<T = any>(config: HttpConfig): HttpPromise<T>;
        get<T = any>(url: string, config?: HttpConfig): HttpPromise<T>;
        delete(url: string, config?: HttpConfig): HttpPromise;
        head(url: string, config?: HttpConfig): HttpPromise;
        post<T = any>(url: string, data?: any, config?: HttpConfig): HttpPromise<T>;
        put<T = any>(url: string, data?: any, config?: HttpConfig): HttpPromise<T>;
        patch<T = any>(url: string, data?: any, config?: HttpConfig): HttpPromise<T>;

    }

}
