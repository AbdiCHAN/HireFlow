import React from "react";

function AdminDashboard() {

  const stats = {
    totalJobs: 24,
    totalUsers: 12,
    totalApplications: 48,
  };

  return (
    <div className="admin-dashboard">

      <h1>Admin Dashboard</h1>

      <div className="dashboard-cards">

        <div className="card">
          <h2>Total Jobs</h2>
          <p>{stats.totalJobs}</p>
        </div>

        <div className="card">
          <h2>Total Users</h2>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="card">
          <h2>Total Applications</h2>
          <p>{stats.totalApplications}</p>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;