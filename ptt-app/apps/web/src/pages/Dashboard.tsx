import { useEffect, useState } from "react";
import { useAuth } from "../auth/authContext";
import MapView from "../components/MapView";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  badgeNumber: string | null;
  licenseNumber: string | null;
  createdAt: string;
  agency: {
    id: string;
    name: string;
    type: string;
  };
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        const data: UserProfile = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      }
    }

    fetchProfile();
  }, [token]);

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button onClick={logout}>Sign Out</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={logout} className="logout-btn">
          Sign Out
        </button>
      </header>

      <div className="profile-card">
        <h2>Your Profile</h2>
        <dl>
          <dt>Email</dt>
          <dd>{profile.email}</dd>

          <dt>Role</dt>
          <dd className={`role-badge role-${profile.role.toLowerCase()}`}>
            {profile.role}
          </dd>

          <dt>Agency</dt>
          <dd>
            {profile.agency.name}{" "}
            <span className="agency-type">({profile.agency.type})</span>
          </dd>

          {profile.badgeNumber && (
            <>
              <dt>Badge</dt>
              <dd>{profile.badgeNumber}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="map-breakout">
        <MapView />
      </div>
    </div>
  );
}
