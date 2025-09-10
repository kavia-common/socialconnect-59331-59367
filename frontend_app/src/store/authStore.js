/**
 * DEPRECATED: Custom auth store removed in favor of Clerk.
 * This file remains as a small compatibility facade to avoid breaking imports.
 * Where possible, use Clerk hooks directly: useUser(), useAuth(), etc.
 */
import { create } from "zustand";
import { useUser, useAuth } from "@clerk/clerk-react";

// PUBLIC_INTERFACE
export const useAuthStore = create(() => ({
  // Compatibility fields; sourced from Clerk on demand
  get token() {
    // Not reactive; prefer useAuth().getToken() in components/effects.
    return null;
  },
  get user() {
    // Not reactive here; prefer useUser() in components.
    return null;
  },
  loading: false,
  error: null,

  // No-ops kept for backward compatibility
  // PUBLIC_INTERFACE
  setToken: () => {},
  // PUBLIC_INTERFACE
  setUser: () => {},
  // PUBLIC_INTERFACE
  logout: async () => {},

  // PUBLIC_INTERFACE
  async login() {
    throw new Error("login() is removed. Use Clerk SignIn component/routes.");
  },
  // PUBLIC_INTERFACE
  async signup() {
    throw new Error("signup() is removed. Use Clerk SignUp component/routes.");
  },
  // PUBLIC_INTERFACE
  async fetchMe() {
    return null;
  },
}));
