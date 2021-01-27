import { httpErrorMap, isFailedFetch, httpMessages, RequestError } from 'utils/errorUtils';

import { BASE_URL, API_BASE, HEADER_X_JWT } from './constants';
import { siteId } from './settings';
import { StaticStore } from './static-store';
import { getCookie } from './cookies';

export type FetcherMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head';
const methods: FetcherMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head'];
type FetchInit<T> = { json?: T; overriddenApiBase?: string } & RequestInit;

type FetcherObject = {
  [K in FetcherMethod]: <T = unknown, K = unknown>(url: string, params?: FetchInit<K>) => Promise<T>;
};

/** JWT token received from server and will be send by each request, if it present */
let activeJwtToken: string | undefined;

const fetcher = methods.reduce<Partial<FetcherObject>>((acc, method) => {
  acc[method] = async <T = unknown, K = unknown>(uri: string, params: FetchInit<K> = {}): Promise<T> => {
    const { json, overriddenApiBase = API_BASE, ...parameters } = params;
    const baseUrl = `${BASE_URL}${overriddenApiBase}`;

    const headers = new Headers({
      'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
    });

    // Save token in memory and pass it into headers in case if storing cookies is disabled
    if (activeJwtToken) {
      headers.append(HEADER_X_JWT, activeJwtToken);
    }

    let url = `${baseUrl}${uri}`;

    if (json) {
      headers.append('Content-Type', 'applcation/json');
      parameters.body = JSON.stringify(json);
    }

    if (siteId && method !== 'post') {
      url += `${url.includes('?') ? '&' : '?'}site=${siteId}`;
    }

    return fetch(url, parameters)
      .then((res) => {
        const date = (res.headers.has('date') && res.headers.get('date')) || '';
        const timestamp = isNaN(Date.parse(date)) ? 0 : Date.parse(date);
        const timeDiff = (new Date().getTime() - timestamp) / 1000;
        StaticStore.serverClientTimeDiff = timeDiff;

        // backend could update jwt in any time. so, we should handle it
        if (res.headers.has(HEADER_X_JWT)) {
          activeJwtToken = res.headers.get(HEADER_X_JWT) as string;
        }

        if (res.status === 403 && activeJwtToken) {
          activeJwtToken = undefined;
        }

        if (res.status >= 400) {
          if (httpErrorMap.has(res.status)) {
            const descriptor = httpErrorMap.get(res.status) || httpMessages.unexpectedError;

            throw new RequestError(descriptor.defaultMessage, res.status);
          }
          return res.text().then((text) => {
            let err;
            try {
              err = JSON.parse(text);
            } catch (e) {
              throw new RequestError(httpMessages.unexpectedError.defaultMessage, 0);
            }
            throw err;
          });
        }

        if (res.headers.get('Content-Type')?.startsWith('application/json')) {
          return res.json();
        }

        return res.text();
      })
      .catch((e) => {
        if (isFailedFetch(e)) {
          throw new RequestError(e.message, -2);
        }

        throw e;
      });
  };
  return acc;
}, {}) as FetcherObject;

export default fetcher;
