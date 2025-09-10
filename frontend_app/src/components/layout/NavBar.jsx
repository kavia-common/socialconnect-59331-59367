import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSocketStore } from "../../services/socket";

/**
 * Top navigation bar with brand, search shortcut, theme toggle and auth actions.
 */
// PUBLIC_INTERFACE
export default function NavBar({ theme = "light", onToggleTheme = () => {} }) {
  /** This component renders the top navigation with logo, links and theme toggle. */
  const navigate = useNavigate();

  // IMPORTANT: Avoid returning a new object from Zustand selector on each render,
  // which can cause "getSnapshot should be cached" warnings and infinite re-renders.
  // Select each field individually so referential equality works as intended.
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const notifications = useSocketStore((s) => s.notifications);
  const unreadCount = (notifications || []).filter((n) => !n?.isRead).length;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/60 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-semibold">
            SocialConnect
          </Link>
          <nav className="hidden md:flex items-center gap-3 text-sm">
            <NavLink to="/" end className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-accent'}`}>Feed</NavLink>
            <NavLink to="/explore" className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-accent'}`}>Explore</NavLink>
            <NavLink to="/create" className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-accent'}`}>Create</NavLink>
            <NavLink to="/search" className={({isActive}) => `px-2 py-1 rounded ${isActive ? 'text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-accent'}`}>Search</NavLink>
            <NavLink to="/notifications" className={({isActive}) => `relative px-2 py-1 rounded ${isActive ? 'text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-accent'}`}>
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                  {Math.min(unreadCount, 9)}
                </span>
              )}
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="theme-toggle !static !relative px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-sm bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {!token ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-700">Log in</Link>
              <Link to="/signup" className="px-3 py-1.5 rounded text-sm bg-accent text-white">Sign up</Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/notifications" className="relative px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-700">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                    {Math.min(unreadCount, 9)}
                  </span>
                )}
              </Link>
              <Link to={`/u/${user?.username || 'me'}`} className="px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-700">Profile</Link>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded text-sm border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
