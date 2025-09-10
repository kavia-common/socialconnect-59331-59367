import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import FormField from "./components/FormField";
import PasswordStrength from "./components/PasswordStrength";

/**
 * Signup page: capture email, username, password and send to backend.
 * Adds client-side validation, username hints, and password strength meter.
 */
// PUBLIC_INTERFACE
export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading, error, token } = useAuthStore((s) => ({
    signup: s.signup,
    loading: s.loading,
    error: s.error,
    token: s.token,
  }));

  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [touched, setTouched] = useState({ email: false, username: false, password: false });

  const isEmail = useMemo(() => /\S+@\S+\.\S+/.test(form.email), [form.email]);
  const usernameOk = useMemo(() => /^[a-zA-Z0-9_]{3,30}$/.test(form.username), [form.username]);
  const passwordOk = useMemo(() => form.password.length >= 8, [form.password]);

  const errors = useMemo(() => {
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    else if (!isEmail) errs.email = "Enter a valid email.";
    if (!form.username) errs.username = "Username is required.";
    else if (!usernameOk) errs.username = "3-30 chars, letters/numbers/underscore only.";
    if (!form.password) errs.password = "Password is required.";
    else if (!passwordOk) errs.password = "At least 8 characters.";
    return errs;
  }, [form, isEmail, usernameOk, passwordOk]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setTouched({ email: true, username: true, password: true });
      return;
    }
    try {
      const data = await signup(form);
      // If token is set after signup, go to onboarding; else go to login.
      const hasToken = (data && data.token) || token;
      navigate(hasToken ? "/onboarding" : "/login");
    } catch {
      // handled in store
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold mb-2 text-center">Create your account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">Join SocialConnect in seconds.</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded p-2 mb-3" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <FormField
            id="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value.trim() }))}
            placeholder="you@example.com"
            required
            autoComplete="email"
            error={touched.email ? errors.email : ""}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          <FormField
            id="username"
            label="Username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.trim() }))}
            placeholder="username"
            required
            autoComplete="username"
            error={touched.username ? errors.username : ""}
            onBlur={() => setTouched((t) => ({ ...t, username: true }))}
            right={
              form.username ? (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    usernameOk ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}
                >
                  {usernameOk ? "OK" : "ERR"}
                </span>
              ) : null
            }
          />
          <div>
            <FormField
              id="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              error={touched.password ? errors.password : ""}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />
            <PasswordStrength password={form.password} />
          </div>

          <button
            disabled={loading}
            className="w-full mt-2 bg-accent text-white py-2 rounded hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
