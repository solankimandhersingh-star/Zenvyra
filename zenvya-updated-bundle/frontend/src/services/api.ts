import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE_URL });
const refreshClient = axios.create({ baseURL: API_BASE_URL });

let refreshPromise: Promise<string | null> | null = null;

const isAuthEndpoint = (url?: string) =>
  !!url && (url.includes('/users/login') || url.includes('/users/refresh'));

const getAccessToken = () =>
  sessionStorage.getItem('zenvya_access_token') ||
  localStorage.getItem('zenvya_access_token');

const getRefreshToken = () =>
  sessionStorage.getItem('zenvya_refresh_token') ||
  localStorage.getItem('zenvya_refresh_token');

const setAuth = (accessToken: string, refreshToken?: string, user?: unknown) => {
  sessionStorage.setItem('zenvya_access_token', accessToken);
  localStorage.setItem('zenvya_access_token', accessToken);

  if (refreshToken) {
    sessionStorage.setItem('zenvya_refresh_token', refreshToken);
    localStorage.setItem('zenvya_refresh_token', refreshToken);
  }

  if (user) {
    const value = JSON.stringify(user);
    sessionStorage.setItem('zenvya_user', value);
    localStorage.setItem('zenvya_user', value);
  }
};

const clearAuthStorage = () => {
  sessionStorage.removeItem('zenvya_access_token');
  sessionStorage.removeItem('zenvya_refresh_token');
  sessionStorage.removeItem('zenvya_user');
  localStorage.removeItem('zenvya_access_token');
  localStorage.removeItem('zenvya_refresh_token');
  localStorage.removeItem('zenvya_user');
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/users/refresh', { refreshToken })
      .then((response) => {
        const { accessToken, refreshToken: rotatedRefreshToken, user } = response.data;
        setAuth(accessToken, rotatedRefreshToken, user);
        return accessToken as string;
      })
      .catch((error) => {
        console.error('Token refresh failed:', error);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const match = window.location.pathname.match(/^\/workspace\/([^/]+)/);
  if (match?.[1]) {
    config.headers['X-Organization-Id'] = match[1];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    if (
      error.response?.status === 401 &&
      (isAuthEndpoint(originalRequest?.url) || originalRequest?._retry)
    ) {
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
