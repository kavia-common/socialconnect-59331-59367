/**
 * Axios API client configured with baseURL from environment.
 * Uses REACT_APP_API_BASE_URL to avoid hardcoding environment-specific values.
 */
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL || "";

export const api = axios.create({
  baseURL,
  withCredentials: false,
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

export default api;
