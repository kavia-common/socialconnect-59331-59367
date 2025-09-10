import React, { useState, useEffect } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SocialConnect
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            TailwindCSS and essentials are set up. Edit <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">src/App.js</code> to get started.
          </p>
          <div className="flex gap-2">
            <a
              href="https://tailwindcss.com/docs/guides/create-react-app"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded bg-accent text-white hover:opacity-90"
            >
              Tailwind Docs
            </a>
            <a
              href="https://reactjs.org"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              React Docs
            </a>
          </div>
        </div>

        <p className="mt-6">
          Current theme: <strong>{theme}</strong>
        </p>
      </header>
    </div>
  );
}

export default App;
