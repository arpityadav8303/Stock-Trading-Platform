import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";

const ProfilePage = () => {
  const { user, stats, refreshProfile } = useAuth();

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="content" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="section">
        <span className="section-title">Profile</span>
        <h3 className="title" style={{ marginBottom: "8px" }}>
          {user.fullName}
        </h3>
        <p style={{ color: "var(--text-muted)" }}>{user.email}</p>
      </div>

      <div className="section">
        <span className="section-title">Account Summary</span>
        <div className="stat-group">
          <div>
            <p className="stat-label">Wallet Balance</p>
            <h3 className="stat-value">₹{Number(stats?.walletBalance || 0).toLocaleString("en-IN")}</h3>
          </div>
          <div>
            <p className="stat-label">Holdings</p>
            <h3 className="stat-value">{stats?.holdingsCount || 0}</h3>
          </div>
          <div>
            <p className="stat-label">Positions</p>
            <h3 className="stat-value">{stats?.positionsCount || 0}</h3>
          </div>
          <div>
            <p className="stat-label">Watchlist</p>
            <h3 className="stat-value">{stats?.watchlistCount || 0}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

