import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchAdminOverview } from "../services/api";

function AdminDashboard({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;

    fetchAdminOverview()
      .then(setOverview)
      .catch((err) => setError(err.message));
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="workspace-page">
        <section className="workspace-card workspace-hero">
          <p className="eyebrow">Admin</p>
          <h1>Login to view the admin dashboard.</h1>
          <button className="btn btn--primary" type="button" onClick={() => onNavigate("login")}>
            Login
          </button>
        </section>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="workspace-page">
        <section className="workspace-card workspace-hero">
          <p className="eyebrow">Admin</p>
          <h1>This dashboard is restricted to admin accounts.</h1>
          <p>Your account can still save jobs, post resources, and manage profile data.</p>
        </section>
      </div>
    );
  }

  const stats = [
    ["Users", overview?.totalUsers || 0],
    ["Jobs", overview?.totalJobs || 0],
    ["Applications", overview?.totalApplications || 0],
    ["API keys", overview?.totalApiKeys || 0],
  ];

  return (
    <div className="workspace-page">
      <section className="workspace-card">
        <p className="eyebrow">Admin dashboard</p>
        <h1>Platform overview</h1>
        {error && <p className="form-message">{error}</p>}

        <div className="admin-grid">
          {stats.map(([label, value]) => (
            <div className="admin-stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="divider" />
        <h2>Recent users</h2>
        <div className="table-list">
          {(overview?.recentUsers || []).map((recentUser) => (
            <div className="table-row" key={recentUser.id}>
              <div>
                <strong>{recentUser.full_name}</strong>
                <small>{recentUser.email}  -  {recentUser.role}</small>
              </div>
              <span>{recentUser.created_at}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
