import axios, { AxiosRequestConfig } from 'axios';
import { Nullable } from '../utilities/interfaces/Emails';

const instance = axios.create({
  baseURL: window.apiUrl,
});

instance.interceptors.response.use(undefined, (error) => {
  const expectedError = error.response
    && error.response.status >= 400
    && error.response.status < 500;

  if (!expectedError) {
    // console.log(error);
    return 'unexpected_error';
  }

  return Promise.reject(error);
});

export default {
  get: instance.get,
  post: instance.post,
  put: instance.put,
  patch: instance.patch,
  delete: instance.delete,
};

type AuthorizationHeader = {
  headers: {
    authorization: Nullable<string>;
  };
};

export function setAuthHeader(entry: string): void {
  instance.defaults.headers.common.authorization = `Bearer ${entry}`;
}

export function addAuthorization(
  requestConfig: AxiosRequestConfig,
  authorization: AuthorizationHeader,
): AxiosRequestConfig {
  const authHeaders = authorization.headers;

  const isAxiosAuthHeader = (value: {
    authorization: Nullable<string>;
  }): value is { authorization: string } => value.authorization != null;

  if (isAxiosAuthHeader(authHeaders)) {
    return { ...requestConfig, headers: authHeaders };
  }
  return requestConfig;
}
