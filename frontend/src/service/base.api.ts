/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type ApiLayoutRef = {
  type?: string;
  name?: string;
  direction?: string;
  item?:
    | ApiLayoutRef[]
    | ApiComponentBannerState
    | ApiComponentNavbarState
    | ApiComponentRadioPlayerState
    | ApiComponentFeedState
    | ApiComponentBoardState
    | ApiComponentThreadState
    | ApiComponentChildrenState
    | (ApiLayoutRef[] &
        ApiComponentBannerState &
        ApiComponentNavbarState &
        ApiComponentRadioPlayerState &
        ApiComponentFeedState &
        ApiComponentBoardState &
        ApiComponentThreadState &
        ApiComponentChildrenState);
}[];

export interface ApiComponentBannerState {
  bannersUrls?: string[];
  /** @format int32 */
  current?: number;
}

export interface ApiComponentNavbarState {
  links?: {
    title?: string;
    href?: string;
  }[];
}

export interface ApiComponentRadioPlayerState {
  status?: {
    mount?: {
      name?: string;
      link?: string;
      apiBasePath?: string;
    };
    status?: {
      scheduling?: boolean;
      playing?: boolean;
      syncing?: boolean;
      streaming?: boolean;
      currentFile?: string;
      thumbnailPath?: string;
      fileData?: {
        filehash?: string;
        path?: string;
        name?: string;
        id3Artist?: string;
        id3Title?: string;
      };
      playlistData?: {
        /** @format int32 */
        id?: number;
        name?: string;
        type?: string;
      };
    };
  }[];
}

export interface ApiComponentFeedState {
  posts?: {
    /** @format int32 */
    id?: number;
    poster?: string;
    subject?: string;
    message?: string;
    truncated_message?: string;
    /** @format int32 */
    timestamp?: number;
    /** @format int32 */
    board_id?: number;
    /** @format int32 */
    parent_id?: number;
    /** @format int32 */
    updated_at?: number;
    /** @format int32 */
    estimate?: number;
    is_verify?: boolean;
    media?: {
      images?: {
        link?: string;
        preview?: string;
      }[];
      youtubes?: {
        link?: string;
        preview?: string;
      }[];
    };
  }[];
}

export interface ApiComponentBoardState {
  posts?: {
    /** @format int32 */
    id?: number;
    poster?: string;
    subject?: string;
    message?: string;
    truncated_message?: string;
    /** @format int32 */
    timestamp?: number;
    /** @format int32 */
    board_id?: number;
    /** @format int32 */
    parent_id?: number;
    /** @format int32 */
    updated_at?: number;
    /** @format int32 */
    estimate?: number;
    is_verify?: boolean;
    media?: {
      images?: {
        link?: string;
        preview?: string;
      }[];
      youtubes?: {
        link?: string;
        preview?: string;
      }[];
    };
    replies?: {
      /** @format int32 */
      id?: number;
      poster?: string;
      subject?: string;
      message?: string;
      truncated_message?: string;
      /** @format int32 */
      timestamp?: number;
      /** @format int32 */
      board_id?: number;
      /** @format int32 */
      parent_id?: number;
      /** @format int32 */
      updated_at?: number;
      /** @format int32 */
      estimate?: number;
      is_verify?: boolean;
      media?: {
        images?: {
          link?: string;
          preview?: string;
        }[];
        youtubes?: {
          link?: string;
          preview?: string;
        }[];
      };
    }[];
  }[];
}

export interface ApiComponentThreadState {
  posts?: {
    /** @format int32 */
    id?: number;
    poster?: string;
    subject?: string;
    message?: string;
    truncated_message?: string;
    /** @format int32 */
    timestamp?: number;
    /** @format int32 */
    board_id?: number;
    /** @format int32 */
    parent_id?: number;
    /** @format int32 */
    updated_at?: number;
    /** @format int32 */
    estimate?: number;
    is_verify?: boolean;
    media?: {
      images?: {
        link?: string;
        preview?: string;
      }[];
      youtubes?: {
        link?: string;
        preview?: string;
      }[];
    };
  }[];
}

export type ApiComponentChildrenState = string;

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '/';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Autogenerated OpenAPI specs
 * @version 1.0.0
 * @baseUrl /
 *
 * API Documentation
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  page = {
    /**
     * @description Returns layout and components for page PageMain
     *
     * @tags common
     * @name GetlistofPagemain
     * @summary Returns layout and components for page PageMain
     * @request GET:/page/PageMain
     */
    getlistofPagemain: (params: RequestParams = {}) =>
      this.request<ApiLayoutRef, any>({
        path: `/page/PageMain`,
        method: 'GET',
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns layout and components for page PageBoard
     *
     * @tags common
     * @name GetlistofPageboard
     * @summary Returns layout and components for page PageBoard
     * @request GET:/page/PageBoard
     */
    getlistofPageboard: (
      query: {
        /** boardId */
        boardId: string;
        /** page */
        page: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiLayoutRef, any>({
        path: `/page/PageBoard`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns layout and components for page PageThread
     *
     * @tags common
     * @name GetlistofPagethread
     * @summary Returns layout and components for page PageThread
     * @request GET:/page/PageThread
     */
    getlistofPagethread: (
      query: {
        /** threadId */
        threadId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiLayoutRef, any>({
        path: `/page/PageThread`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns layout and components for page PageMainLayout
     *
     * @tags common
     * @name GetlistofPagemainlayout
     * @summary Returns layout and components for page PageMainLayout
     * @request GET:/page/PageMainLayout
     */
    getlistofPagemainlayout: (params: RequestParams = {}) =>
      this.request<ApiLayoutRef, any>({
        path: `/page/PageMainLayout`,
        method: 'GET',
        format: 'json',
        ...params,
      }),
  };
}
