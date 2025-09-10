import { NavLink } from "react-router-dom";

/**
 * Desktop side navigation
 */
// PUBLIC_INTERFACE
export default function SideNav() {
  return (
    <nav className="sticky top-16 p-2 space-y-1">
      <SideLink to="/" label="Home" />
      <SideLink to="/explore" label="Explore" />
      <SideLink to="/search" label="Search" />
    </nav>
  );
}

function SideLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm ${
          isActive
            ? "bg-gray-100 dark:bg-zinc-800 text-accent"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
