import { NavLink } from "react-router-dom";

/**
 * Mobile bottom navigation
 */
// PUBLIC_INTERFACE
export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 h-14 bg-white/90 dark:bg-zinc-900/90 border-t border-gray-200 dark:border-zinc-800 backdrop-blur">
      <div className="h-full max-w-md mx-auto grid grid-cols-3">
        <BottomLink to="/" label="Home" />
        <BottomLink to="/explore" label="Explore" />
        <BottomLink to="/search" label="Search" />
      </div>
    </nav>
  );
}

function BottomLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center justify-center text-sm ${
          isActive ? "text-accent" : "text-gray-700 dark:text-gray-300"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
