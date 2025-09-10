import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import { useAuthStore } from './store/authStore';

// Layout components
import NavBar from './components/layout/NavBar';
import SideNav from './components/layout/SideNav';
import BottomNav from './components/layout/BottomNav';
import RightSidebar from './components/layout/RightSidebar';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import PostDetails from './pages/PostDetails';
import Search from './pages/Search';

// PUBLIC_INTERFACE
function App() {
  // Prefer system theme on first load
  const prefersDark = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    []
  );
  const [theme, setTheme] = useState(prefersDark ? 'dark' : 'light');

  // Apply theme to root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // add Tailwind dark class toggle for utilities support
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-zinc-900 dark:text-white transition-colors">
      <BrowserRouter>
        {/* Global top nav */}
        <NavBar theme={theme} onToggleTheme={toggleTheme} />

        {/* Main responsive layout: side nav + content + right sidebar */}
        <div className="mx-auto max-w-7xl px-0 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6">
            <aside className="hidden md:block md:col-span-2 lg:col-span-2">
              <SideNav />
            </aside>

            <main className="col-span-1 md:col-span-7 lg:col-span-7 min-h-[calc(100vh-64px)]">
              <Routes>
                {/* Public routes */}
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Feed />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/p/:postId" element={<PostDetails />} />
                  <Route path="/u/:username" element={<Profile />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <aside className="hidden lg:block md:col-span-3 lg:col-span-3">
              <RightSidebar />
            </aside>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </BrowserRouter>
    </div>
  );
}

// PUBLIC_INTERFACE
function ProtectedRoute() {
  /** Route guard for authenticated-only routes */
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// PUBLIC_INTERFACE
function PublicOnlyRoute() {
  /** Route guard that prevents authenticated users from viewing public-only pages like login/signup */
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default App;
