import Axios from 'axios';
import { BASEAPI_PATH, WHITELISTED_API_ROUTES } from './contants';

let instance = Axios.create({
  baseURL: BASEAPI_PATH,
  timeout: 3600000,
});

export function setToken(token) {
  if (!token) {
    return;
  }
  instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function removeToken() {
  delete instance.defaults.headers.common['Authorization'];
}

instance.interceptors.request.use(
  (request) => {
    if (WHITELISTED_API_ROUTES.includes(request.url)) {
      delete request.headers.Authorization;
    }
    return request;
  },
  (error) => {
    throw error;
  },
);

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (
      error.response.data.message === 'jwt expired' &&
      error.response.status === 401
    ) {
      // router.replace(
      //   `/user/signin?redirect=${encodeURIComponent(
      //     router.asPath
      //   )}&te=${encodeURIComponent("session expired please login again")}`
      // );
    }

    // return Promise.reject(error.response.data.error)

    if (error.response) {
      // console.log({ error });
      // error.response.data.error.statusCode = error.response.status || 400;
      return Promise.reject(error.response.data);
    }

    if (error.request) {
      error.request.statusCode = 400;
      return Promise.reject(error.request);
    }
    error.statusCode = error.status || 400;
    return Promise.reject(error);
  },
);

const axios = instance;

export default axios;
