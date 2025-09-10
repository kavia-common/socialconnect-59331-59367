import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import FormField from "./components/FormField";

/**
 * Login page with email/username and password.
 * Adds inline client validation and error feedback.
 */
// PUBLIC_INTERFACE
export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const isEmail = useMemo(() => /\S+@\S+\.\S+/.test(form.identifier), [form.identifier]);

  const errors = useMemo(() => {
    const errs = {};
    if (!form.identifier.trim()) {
      errs.identifier = "Please enter your email or username.";
    } else if (form.identifier.includes("@") && !isEmail) {
      errs.identifier = "Enter a valid email address.";
    }
    if (!form.password) errs.password = "Please enter your password.";
    return errs;
  }, [form, isEmail]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setTouched({ identifier: true, password: true });
      return;
    }
    const payload = form.identifier.includes("@")
      ? { email: form.identifier, password: form.password }
      : { username: form.identifier, password: form.password };
    try {
      await login(payload);
      navigate("/", { replace: true });
    } catch {
      // error handled in store
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold mb-2 text-center">Welcome back</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">Log in to continue to SocialConnect.</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded p-2 mb-3" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <FormField
            id="identifier"
            label="Email or Username"
            value={form.identifier}
            onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
            placeholder="you@example.com or username"
            autoComplete="username"
            required
            error={touched.identifier ? errors.identifier : ""}
            onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
          />
          <FormField
            id="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            error={touched.password ? errors.password : ""}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
          <button
            disabled={loading}
            className="w-full mt-2 bg-accent text-white py-2 rounded hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
