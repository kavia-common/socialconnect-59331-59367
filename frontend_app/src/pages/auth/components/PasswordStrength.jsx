import React, { useMemo } from "react";

/**
 * Lightweight password strength indicator.
 * Heuristic: length, digits, lowercase, uppercase, special.
 */
// PUBLIC_INTERFACE
export default function PasswordStrength({ password = "" }) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 5);
  }, [password]);

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Strong+"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500", "bg-emerald-600"];

  return (
    <div className="mt-1">
      <div className="flex gap-1 h-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded ${i < score ? colors[Math.max(0, score - 1)] : "bg-gray-200 dark:bg-zinc-700"}`}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">{labels[score] || labels[0]}</p>
    </div>
  );
}
