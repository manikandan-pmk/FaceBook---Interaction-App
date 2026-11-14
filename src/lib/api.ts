
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate Axios instance: refresh requests must not trigger
// the main response interceptor.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const refreshUrl = "/api/v1/auth/refresh";

let refreshPromise: Promise<void> | null = null;

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    // Never refresh when login/register/refresh itself fails.
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // All simultaneous 401 requests share one refresh request.
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post(refreshUrl)
          .then(() => undefined)
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;

      // Browser automatically sends the newly updated HttpOnly cookie.
      return api(originalRequest);

    } catch (refreshError) {
      refreshPromise = null;

      console.error("Session expired. Please login again.");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;
