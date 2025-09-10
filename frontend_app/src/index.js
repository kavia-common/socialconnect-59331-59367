import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Entry point renders App wrapped in ClerkProvider for auth.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => window.history.pushState(null, '', to)}
      appearance={{
        // Simple, sleek theme tuned to app accent and dark mode
        variables: {
          colorPrimary: '#0095f6',
          colorText: '#111827',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#111827',
          borderRadius: '0.5rem',
          fontSize: '14px',
        },
        baseTheme: {
          // Light/Dark auto based on prefers-color-scheme; Clerk reacts to CSS
          // We’ll keep defaults and rely on our global dark class
        },
        elements: {
          card: 'shadow-none border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900',
          headerTitle: 'text-xl font-semibold',
          headerSubtitle: 'text-sm text-gray-600 dark:text-gray-400',
          socialButtonsProviderIcon__apple: 'dark:invert',
          formFieldInput: 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800',
          footerActionText: 'text-sm',
          footerActionLink: 'text-accent hover:opacity-80',
          formButtonPrimary: 'bg-accent hover:opacity-90',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
