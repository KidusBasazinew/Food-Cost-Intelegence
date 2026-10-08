import axios from "axios";

import { clientEnv } from "@/lib/env";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const http = axios.create({
  baseURL: clientEnv.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: clientEnv.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAuthEndpoint(url = "") {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout")
  );
}

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh", {})
      .then((res) => {
        const payload = res?.data;
        if (!payload?.success)
          throw new Error(payload?.message || "Refresh failed");

        const { accessToken, user } = payload.data || {};
        if (!accessToken) throw new Error("Missing access token");

        const { setAuth } = useAuthStore.getState();
        setAuth({ accessToken, user });

        return accessToken;
      })
      .catch((err) => {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;
    const url = original?.url || "";

    if (!original || status !== 401 || original._retry || isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${token}`;
      return http(original);
    } catch (err) {
      return Promise.reject(err);
    }
  },
);
