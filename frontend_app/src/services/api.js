/**
 * Axios API client configured with baseURL from environment.
 * Uses REACT_APP_API_BASE_URL to avoid hardcoding environment-specific values.
 */
// PUBLIC_INTERFACE
/** Create and configure the shared Axios API instance. */
import axios from "axios";

const normalizeBase = (url) => (url || "").replace(/\/+$/, "");
const baseURL = normalizeBase(process.env.REACT_APP_API_BASE_URL || "");

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from auth store if available (lazy import to avoid circular deps)
api.interceptors.request.use(async (config) => {
  try {
    const { useAuthStore } = await import("../store/authStore");
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // store might not be initialized yet; ignore
  }
  return config;
});

// Basic error normalization
api.interceptors.response.use(
  (res) => res,
  (err) => {
    err.normalizedMessage =
      err?.response?.data?.message ||
      err?.message ||
      "Request failed. Please try again.";
    return Promise.reject(err);
  }
);

// PUBLIC_INTERFACE
export const setApiBaseURL = (url) => {
  api.defaults.baseURL = normalizeBase(url);
};

export default api;
