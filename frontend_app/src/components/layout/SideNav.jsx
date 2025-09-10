import { NavLink } from "react-router-dom";
import { useSocketStore } from "../../services/socket";

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
      <SideLink to="/create" label="Create" />
      <SideLinkWithBadge to="/notifications" label="Notifications" />
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

function SideLinkWithBadge({ to, label }) {
  const notifications = useSocketStore((s) => s.notifications);
  const unreadCount = (notifications || []).filter((n) => !n?.isRead).length;
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative block px-3 py-2 rounded-md text-sm ${
          isActive
            ? "bg-gray-100 dark:bg-zinc-800 text-accent"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60"
        }`
      }
    >
      <span>{label}</span>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-2 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">
          {Math.min(unreadCount, 9)}
        </span>
      )}
    </NavLink>
  );
}
