import { useMemo } from "react";
import { useAuth } from "../auth/authContext";

export default function TopBar({ onProfileClick }: { onProfileClick?: () => void }) {
  const { user, isAuthenticated } = useAuth();

  const title = user?.email ?? "Profile";

  const initials = useMemo(() => {
    if (!user?.email) return "FR";
    const local = user.email.split("@")[0];
    const parts = local.split(/\.|_|-|\+/).filter(Boolean);
    if (parts.length === 0) return local.slice(0, 2).toUpperCase();
    return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0]).toUpperCase();
  }, [user]);

  if (!isAuthenticated) return null;

  return (
    <header className="top-bar" role="banner">
      <div className="top-bar-inner">
        <div className="app-title">First Response</div>

        <div className="top-bar-right">
          <button
            className="profile-emblem"
            title={title}
            aria-label="Open profile"
            onClick={() => onProfileClick?.()}
          >
            {/* person icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="profile-icon"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
