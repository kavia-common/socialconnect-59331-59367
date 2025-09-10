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

/**
 * Attach token from Clerk if available.
 * We lazy import Clerk to avoid issues during test or non-browser contexts.
 */
api.interceptors.request.use(async (config) => {
  try {
    const clerk = await import("@clerk/clerk-react");
    const token = await clerk?.useAuth?.()?.getToken?.();
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // ignore when Clerk not ready
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
