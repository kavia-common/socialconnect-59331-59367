import React from "react";

/**
 * Small form field with label, input, and error.
 * Tailwind-styled; suitable for auth forms.
 */
// PUBLIC_INTERFACE
export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  required,
  right = null,
  ...rest
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded border bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none transition-colors
            ${error ? "border-red-500 focus:ring-2 focus:ring-red-400" : "border-gray-300 dark:border-zinc-700 focus:ring-2 focus:ring-accent/50"}`}
          {...rest}
        />
        {right && <div className="absolute inset-y-0 right-2 flex items-center">{right}</div>}
      </div>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
