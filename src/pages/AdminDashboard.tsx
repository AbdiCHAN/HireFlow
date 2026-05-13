import { useEffect, useMemo, useState } from "react";
import { apiRequest, authHeaders, normalizeTags } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STAT_LABELS = {
  users: "Users",
  jobs: "Jobs",
  cvs: "CVs",
  applications: "Applications",
};

function EmptyRow({ label, colSpan = 4 }: { label: string; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ color: "var(--text3)", padding: "22px 14px", textAlign: "center" }}>
        {label}
      </td>
    </tr>
  );
}

function DataTable({ title, columns, rows, emptyLabel }: any) {
  return (
    <section style={{ marginTop: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontSize: 22, fontWeight: 800 }}>{title}</h2>
        <span style={{ color: "var(--text3)", fontSize: 13 }}>{rows.length} total</span>
      </div>
      <div style={{ overflowX: "auto", border: "1px solid var(--border2)", borderRadius: "var(--r-lg)", background: "var(--surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr style={{ background: "var(--surface2)" }}>
              {columns.map((column: any) => (
                <th key={column.key} style={{ padding: "12px 14px", textAlign: "left", color: "var(--text2)", fontSize: 12, textTransform: "uppercase" }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <EmptyRow label={emptyLabel} colSpan={columns.length} />
            ) : (
              rows.map((row: any, index: number) => (
                <tr key={row.id || index} style={{ borderTop: "1px solid var(--border2)" }}>
                  {columns.map((column: any) => (
                    <td key={column.key} style={{ padding: "13px 14px", color: "var(--text)", fontSize: 13, verticalAlign: "top" }}>
                      {column.render ? column.render(row) : row[column.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, isAuthenticated } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await apiRequest("/api/admin/overview", {
        headers: authHeaders(),
      });
      setOverview(data.data);
    } catch (error: any) {
      setMessage(error.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      loadOverview();
    }
  }, [isAuthenticated, user?.role]);

  const applicationColumns = useMemo(() => [
    { key: "jobTitle", label: "Job" },
    { key: "applicantName", label: "Applicant" },
    { key: "applicantEmail", label: "Email" },
    { key: "status", label: "Status", render: (row: any) => (
      <span style={{ padding: "4px 10px", borderRadius: 99, background: "var(--violet-bg)", color: "var(--violet-lt)", fontWeight: 700 }}>
        {row.status}
      </span>
    ) },
    { key: "createdAt", label: "Applied", render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
  ], []);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: "70px 0 110px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--text)" }}>Admin Dashboard</h1>
        <p style={{ color: "var(--text2)", margin: "12px auto 24px", maxWidth: 520 }}>Log in with an admin account to view jobs, CVs, applications, and users.</p>
        <button className="btn btn--primary" onClick={() => onNavigate("login")}>Login</button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="container" style={{ padding: "70px 0 110px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, color: "var(--text)" }}>Admin Only</h1>
        <p style={{ color: "var(--text2)", margin: "12px auto 24px", maxWidth: 520 }}>Your account does not have permission to view this area.</p>
        <button className="btn btn--outline" onClick={() => onNavigate("home")}>Back Home</button>
      </div>
    );
  }

  const stats = overview?.stats || {};
  const statItems = Object.entries(STAT_LABELS).map(([key, label]) => ({
    label,
    value: stats[key] || 0,
  }));

  return (
    <div className="container" style={{ padding: "54px 0 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "var(--violet-lt)", fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, color: "var(--text)", fontWeight: 800 }}>System Dashboard</h1>
          <p style={{ color: "var(--text2)", marginTop: 8 }}>View all jobs, CV uploads, applications, and accounts from one place.</p>
        </div>
        <button className="btn btn--outline" onClick={loadOverview} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {message && (
        <div style={{ marginBottom: 20, padding: 14, background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: "var(--r-md)" }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 }}>
        {statItems.map((item) => (
          <div key={item.label} style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--r-lg)", padding: 18 }}>
            <p style={{ color: "var(--text3)", fontSize: 12, textTransform: "uppercase", fontWeight: 800 }}>{item.label}</p>
            <p style={{ color: "var(--text)", fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, marginTop: 8 }}>{item.value}</p>
          </div>
        ))}
      </div>

      <DataTable
        title="Applications"
        rows={overview?.applications || []}
        emptyLabel="No applications yet"
        columns={applicationColumns}
      />

      <DataTable
        title="Jobs"
        rows={overview?.jobs || []}
        emptyLabel="No jobs yet"
        columns={[
          { key: "title", label: "Title" },
          { key: "company", label: "Company" },
          { key: "location", label: "Location" },
          { key: "sourceName", label: "Source", render: (row: any) => row.sourceName || row.source || "HireFlow" },
          { key: "tags", label: "Tags", render: (row: any) => normalizeTags(row.tags).join(", ") || "-" },
        ]}
      />

      <DataTable
        title="CV Uploads"
        rows={overview?.cvs || []}
        emptyLabel="No CVs uploaded yet"
        columns={[
          { key: "full_name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "current_role", label: "Current Role" },
          { key: "expected_salary", label: "Expected Salary" },
        ]}
      />

      <DataTable
        title="Users"
        rows={overview?.users || []}
        emptyLabel="No users yet"
        columns={[
          { key: "username", label: "Username" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "createdAt", label: "Joined", render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-" },
        ]}
      />
    </div>
  );
}

export default AdminDashboard;
