import { NavLink } from "react-router-dom";
import { useSocketStore } from "../../services/socket";

/**
 * Mobile bottom navigation with notifications badge
 */
// PUBLIC_INTERFACE
export default function BottomNav() {
  const notifications = useSocketStore((s) => s.notifications);
  const unreadCount = (notifications || []).filter((n) => !n?.isRead).length;

  return (
    <nav className="fixed bottom-0 inset-x-0 h-14 bg-white/90 dark:bg-zinc-900/90 border-t border-gray-200 dark:border-zinc-800 backdrop-blur">
      <div className="h-full max-w-md mx-auto grid grid-cols-5">
        <BottomLink to="/" label="Home" />
        <BottomLink to="/explore" label="Explore" />
        <BottomLink to="/create" label="Create" />
        <BottomLink to="/search" label="Search" />
        <BottomLink
          to="/notifications"
          label={<BadgeLabel label="Alerts" count={unreadCount} />}
        />
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

function BadgeLabel({ label, count }) {
  return (
    <span className="relative">
      {label}
      {count > 0 && (
        <span className="absolute -top-2 -right-3 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-500 text-white">
          {Math.min(count, 9)}
        </span>
      )}
    </span>
  );
}
