import { useAuth } from "../context/AuthContext";

function Icon({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ariaHidden: "true",
  };

  const paths = {
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 10v10h14V10" />
      </>
    ),
    jobs: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
    network: (
      <>
        <path d="M16 11a4 4 0 1 0-8 0" />
        <path d="M3 20a7 7 0 0 1 18 0" />
        <path d="M17 8h4" />
        <path d="M19 6v4" />
      </>
    ),
    messages: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    news: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20V5H6.5A2.5 2.5 0 0 0 4 7.5z" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </>
    ),
    saved: (
      <>
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </>
    ),
    key: (
      <>
        <circle cx="7.5" cy="15.5" r="4.5" />
        <path d="M11 12 21 2" />
        <path d="m17 6 2 2" />
        <path d="m14 9 2 2" />
      </>
    ),
  };

  return <svg {...common}>{paths[type] || paths.home}</svg>;
}

function Navbar({ activePage = "home", onNavigate = () => {}, savedCount = 0 }) {
  const { user, isAuthenticated, logout } = useAuth();

  const links = [
    { key: "home", label: "Feed", icon: "home" },
    { key: "jobs", label: "Jobs", icon: "jobs" },
    { key: "network", label: "Network", icon: "network" },
    { key: "messages", label: "Messages", icon: "messages" },
    { key: "profile", label: "Profile", icon: "profile" },
    { key: "news", label: "News", icon: "news" },
  ];

  const handleLogout = () => {
    logout();
    onNavigate("home");
  };

  return (
    <nav className="navbar navbar--linkedin">
      <div className="container navbar__inner">
        <button
          type="button"
          className="navbar__logo"
          onClick={() => onNavigate("home")}
        >
          <span className="navbar__logo-mark">hf</span>
          <span>HireFlow</span>
        </button>

        <div className="navbar__search" role="search">
          <Icon type="jobs" />
          <span>Search jobs and people</span>
        </div>

        <div className="navbar__links">
          {links.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              className={`navbar__link ${
                activePage === key ? "navbar__link--active" : ""
              }`}
              onClick={() => onNavigate(key)}
            >
              <Icon type={icon} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__saved"
            onClick={() => onNavigate("jobs")}
            aria-label={`${savedCount} saved jobs`}
            title="Saved jobs"
          >
            <Icon type="saved" />
            <span className="navbar__saved-badge">{savedCount}</span>
          </button>

          <button
            type="button"
            className="navbar__icon-action"
            onClick={() => onNavigate("api-keys")}
            title="API keys"
          >
            <Icon type="key" />
          </button>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate("post-job")}
          >
            Post job
          </button>

          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => onNavigate("admin")}
                >
                  Admin
                </button>
              )}

              <span className="navbar__user">{user?.username || "Account"}</span>

              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => onNavigate("login")}
              >
                Login
              </button>

              <button
                type="button"
                className="btn btn--outline"
                onClick={() => onNavigate("signup")}
              >
                Join
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;