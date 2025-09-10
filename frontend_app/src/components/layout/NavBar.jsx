import { Link, NavLink } from "react-router-dom";
import { useSocketStore } from "../../services/socket";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

/**
 * Top navigation bar with brand, search shortcut, theme toggle and auth actions.
 */
// PUBLIC_INTERFACE
export default function NavBar({ theme = "light", onToggleTheme = () => {} }) {
  /** This component renders the top navigation with logo, links and theme toggle. */
  const notifications = useSocketStore((s) => s.notifications);
  const unreadCount = (notifications || []).filter((n) => !n?.isRead).length;

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
            <SignedIn>
              <NavLink to="/notifications" className={({isActive}) => `relative px-2 py-1 rounded ${isActive ? 'text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-accent'}`}>
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                    {Math.min(unreadCount, 9)}
                  </span>
                )}
              </NavLink>
            </SignedIn>
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

          <SignedOut>
            <div className="flex items-center gap-2">
              <Link to="/sign-in" className="px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-700">Log in</Link>
              <Link to="/sign-up" className="px-3 py-1.5 rounded text-sm bg-accent text-white">Sign up</Link>
            </div>
          </SignedOut>
          <SignedIn>
            <Link to="/notifications" className="relative px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-700">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                  {Math.min(unreadCount, 9)}
                </span>
              )}
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
