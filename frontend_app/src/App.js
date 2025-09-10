import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { createSocket, useSocketStore } from './services/socket';
import { SignedIn, SignedOut, useAuth, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';

// Layout components
import NavBar from './components/layout/NavBar';
import SideNav from './components/layout/SideNav';
import BottomNav from './components/layout/BottomNav';
import RightSidebar from './components/layout/RightSidebar';

// Pages (remove custom Login/Signup/Onboarding usage)
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import PostDetails from './pages/PostDetails';
import Search from './pages/Search';
import Notifications from './pages/Notifications';

// Lazy-load CreatePost to keep initial bundle smaller
const CreatePostLazy = React.lazy(() => import('./pages/CreatePost'));

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

  // Socket wiring via Clerk session token when available
  const { getToken } = useAuth();
  const setConnected = useSocketStore((s) => s.setConnected);
  const addNotification = useSocketStore((s) => s.addNotification);
  const socketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Fetch a token from Clerk if signed in (may be null when signed out)
      const token = await getToken?.();
      // When token changes, (re)create socket connection
      if (!cancelled && token) {
        socketRef.current = createSocket(token);
        const socket = socketRef.current;

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('notification', (payload) => {
          addNotification(payload || { type: 'info', message: 'New notification' });
        });

        socket.connect();
      }
    })();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [getToken, setConnected, addNotification]);

  // Build a Router
  const router = useMemo(() => {
    return createBrowserRouter(
      [
        {
          path: "/",
          element: (
            <AppLayout theme={theme} onToggleTheme={toggleTheme} />
          ),
          children: [
            // Clerk hosted components for sign-in/sign-up
            { path: "sign-in/*", element: <SignIn routing="path" path="/sign-in" /> },
            { path: "sign-up/*", element: <SignUp routing="path" path="/sign-up" /> },

            // Protected routes
            {
              element: <ProtectedRouteInternal />,
              children: [
                { index: true, element: <Feed /> },
                { path: "explore", element: <Explore /> },
                { path: "create", element: <CreatePostLazy /> },
                { path: "search", element: <Search /> },
                { path: "p/:postId", element: <PostDetails /> },
                { path: "u/:username", element: <Profile /> },
                { path: "notifications", element: <Notifications /> },
              ],
            },
            // Fallback
            { path: "*", element: <Navigate to="/" replace /> },
          ],
        },
      ],
      {
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        },
      }
    );
  }, [theme, toggleTheme]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-zinc-900 dark:text-white transition-colors">
      <RouterProvider router={router} />
    </div>
  );
}

function AppLayout({ theme, onToggleTheme }) {
  const location = useLocation();
  return (
    <>
      {/* Global top nav */}
      <NavBar theme={theme} onToggleTheme={onToggleTheme} />
      {/* Connected indicator (top small bar) */}
      <SocketStatusBar />
      {/* Main responsive layout: side nav + content + right sidebar */}
      <div className="mx-auto max-w-7xl px-0 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6">
          <aside className="hidden md:block md:col-span-2 lg:col-span-2">
            <SideNav />
          </aside>

          <main className="col-span-1 md:col-span-7 lg:col-span-7 min-h-[calc(100vh-64px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="h-full"
              >
                <React.Suspense fallback={<div className="p-4 text-sm text-gray-600 dark:text-gray-400">Loading...</div>}>
                  <Outlet />
                </React.Suspense>
              </motion.div>
            </AnimatePresence>
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
    </>
  );
}

// Clerk-based protection
function ProtectedRouteInternal() {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function SocketStatusBar() {
  const connected = useSocketStore((s) => s.connected);
  return (
    <div
      className={`h-1 ${connected ? 'bg-green-500' : 'bg-yellow-500'} transition-colors`}
      aria-hidden
    />
  );
}

export default App;
