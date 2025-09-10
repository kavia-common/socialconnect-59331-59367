/**
 * Authentication store using Zustand.
 * Persists token and user in localStorage and provides helpers for login/logout/me.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

// PUBLIC_INTERFACE
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      // PUBLIC_INTERFACE
      setToken: (token) => set({ token }),

      // PUBLIC_INTERFACE
      setUser: (user) => set({ user }),

      // PUBLIC_INTERFACE
      logout: () => {
        set({ token: null, user: null });
        // Optionally call backend logout endpoint (stateless)
        return api.post("/auth/logout").catch(() => {});
      },

      // PUBLIC_INTERFACE
      async login({ email, username, password }) {
        set({ loading: true, error: null });
        try {
          const payload = email ? { emailOrUsername: email, password } : { emailOrUsername: username, password };
          const res = await api.post("/auth/login", payload);
          const { token, user } = res.data || {};
          set({ token: token || null, user: user || null, loading: false });
          return { token, user };
        } catch (err) {
          const message = err?.normalizedMessage || err?.response?.data?.message || err?.message || "Login failed. Please try again.";
          set({ error: message, loading: false });
          throw err;
        }
      },

      // PUBLIC_INTERFACE
      async signup({ email, username, password }) {
        set({ loading: true, error: null });
        try {
          const res = await api.post("/auth/signup", { email, username, password });
          set({ loading: false });
          return res.data;
        } catch (err) {
          const message = err?.normalizedMessage || err?.response?.data?.message || err?.message || "Signup failed. Please try again.";
          set({ error: message, loading: false });
          throw err;
        }
      },

      // PUBLIC_INTERFACE
      async fetchMe() {
        if (!get().token) return null;
        try {
          const res = await api.get("/auth/me");
          set({ user: res.data || null });
          return res.data;
        } catch {
          // token invalid; clear session
          set({ token: null, user: null });
          return null;
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
