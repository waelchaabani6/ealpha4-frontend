import { store } from '@shared/store';
import { resetStoreBranch, resetStoreSchool } from '@shared/store/schoolSlice';
import { forceLogout, resetUser } from '@shared/store/userSlice';
import toast from '@shared/toast';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';

export const api = (baseURL: string) => {
  const instance = axios.create({
    // baseURL: import.meta.env.VITE_APP_URL
    baseURL
  });

  instance.interceptors.request.use((req: any) => {
    req.headers.Authorization = localStorage.getItem('token');
    return req;
  });

  instance.interceptors.response.use(
    (res: any) => res,
    async (error: any) => {
      const statusCode = error?.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        try {
          const res = await getRefreshToken();
          // const tokenObj = res?.data?.response?.data;
          const tokenObj = res?.data;
          // const token = `${tokenObj?.TokenType} ${tokenObj?.access}`;
          const token = `${tokenObj?.access}`;
          localStorage.setItem('token', `Bearer ${token}`);
          error.config.headers.Authorization = token;
          return axios(error.config);
        } catch (err: any) {
          controller.abort();
          toast('error', 'Your token is expired, please re-login');
          const rememberUser = localStorage.getItem('rememberUser');
          if (rememberUser) {
            const tmp = JSON.parse(rememberUser);
            tmp.password = '';
            localStorage.setItem('rememberUser', JSON.stringify(tmp));
          }
          // window.location.replace('/auth');
          localStorage.removeItem('RefreshToken');
          localStorage.removeItem('token');
          store.dispatch(resetUser());
          store.dispatch(resetStoreSchool());
          store.dispatch(resetStoreBranch());
          store.dispatch(forceLogout(true));
        }
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

const controller = new AbortController();

function getRefreshToken() {
  const config = {
    method: 'post',
    url: `${import.meta.env.VITE_APP_USER_SERVICE_URL}users-service/get-access-token/`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      refresh: localStorage.getItem('RefreshToken')
    }
  };
  return axios.request(config);
}

const getResponse = (baseURL: string, resource: string, data: any) => (
  api(baseURL).post(resource, data, {
    headers: {
      Accept: 'application/json'
    }
  })
);

export const useRAWApi = ({ baseURL, url, ...rest }: any) => useMutation((data) => getResponse(baseURL, url, data), {
  ...rest,
  cacheTime: 0,
  retry: false
}) as any;

export const useRAWGetApi = ({ baseURL, url, ...rest }: any) => (
  useQuery(url, () => api(baseURL).get(url, { signal: controller.signal }), {
    ...rest,
    // cacheTime: 0,
    // retry: false,
    refetchOnWindowFocus: false
    // select: ({ data }: any) => data
  })
);

export const useGet = ({ baseURL, url, ...rest }: any) => (
  useQuery(url, () => api(baseURL).get(url, { signal: controller.signal }), {
    ...rest,
    // cacheTime: 0,
    // retry: false,
    refetchOnWindowFocus: false
    // select: ({ data }: any) => data
  })
) as any;

export const usePost = ({ baseURL, url, ...rest }: any) => useMutation((data: any) => api(baseURL).post(url, data), {
  ...rest,
  cacheTime: 0,
  retry: false
});

export const usePatch = ({ baseURL, url, ...rest }: any) => (
  useMutation((data: any) => api(baseURL).patch(url, data), {
    ...rest,
    retry: false,
    cacheTime: 0
  })
);

export const usePut = ({ baseURL, url, ...rest }: any) => (
  useMutation((data: any) => api(baseURL).put(url, data), {
    ...rest
    // retry: false,
    // cacheTime: 0,
  })
);

export const useDelete = ({ baseURL, url, ...rest }: any) => useMutation((data?: any) => api(baseURL).delete(`${url}`, { data }), {
  ...rest
  // retry: false,
  // cacheTime: 0,
}) as any;

export const useMultiDownload = ({ baseURL, url, ...rest }: any) => useMutation((data: any) => api(baseURL).post(url, data, { responseType: 'arraybuffer' }), {
  ...rest,
  cacheTime: 0,
  retry: false
});
