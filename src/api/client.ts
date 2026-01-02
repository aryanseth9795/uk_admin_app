import axios from "axios";
import { API_BASE_URL } from "@/utils/env";
import { store } from "@/store";
import { saveTokens } from "@/utils/tokenStorage";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  const state = store.getState();
  const refreshToken = state.auth.refreshToken;
  if (!refreshToken) {
    isRefreshing = false;
    return null;
  }
  refreshPromise = api
    .post("/admin/refresh", { refresh_token: refreshToken })
    .then((res) => {
      const accessToken = res.data?.access_token as string;
      const newRefresh = res.data?.refresh_token as string;
      if (accessToken) {
        store.dispatch({
          type: "auth/setTokens",
          payload: { accessToken, refreshToken: newRefresh },
        });
        saveTokens(accessToken, newRefresh);
      }

      return accessToken ?? null;
    })
    .catch(() => null)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.accessToken;
  if (token) {
    config.headers = {
      ...config.headers,
      // "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
