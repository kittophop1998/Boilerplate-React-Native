import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const TOKEN_KEY = '@auth_token';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor — attach token automatically ─────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // If storage fails, proceed without token
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor — handle global errors ──────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired / invalid — clear storage so AuthContext re-routes to login
      await AsyncStorage.removeItem(TOKEN_KEY);
      // Optionally emit an event / call a global logout handler here
    }

    return Promise.reject(error);
  },
);

export default api;
