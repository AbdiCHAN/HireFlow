import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Feed", page: "home", icon: "home" },
  { label: "Jobs", page: "jobs", icon: "briefcase" },
  { label: "Network", page: "network", icon: "network" },
  { label: "Messages", page: "messages", icon: "message" },
  { label: "Profile", page: "profile", icon: "user" },
  { label: "News", page: "news", icon: "news" },
];

const ICONS = {
  home: (
    <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 19.5z" />
  ),
  briefcase: (
    <>
      <path d="M9 6V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V6" />
      <rect x="4" y="6" width="16" height="13" rx="2" />
      <path d="M4 11h16" />
    </>
  ),
  network: (
    <>
      <path d="M16 11a4 4 0 1 0-8 0" />
      <path d="M12 7V3" />
      <path d="M4 21a8 8 0 0 1 16 0" />
      <path d="M18 8l3-2" />
    </>
  ),
  message: (
    <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  news: (
    <>
      <rect x="6" y="4" width="12" height="16" rx="1.5" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  save: <path d="M6 4h12v17l-6-4-6 4z" />,
  key: (
    <>
      <circle cx="8" cy="12" r="3" />
      <path d="M11 12h10M17 12v-3M20 12v3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="5" />
      <path d="m16 16 4 4" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

function Navbar({ activePage, onNavigate, savedCount = 0, searchTerm = "", setSearchTerm }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState(searchTerm);

  const goTo = (page) => {
    onNavigate?.(page);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchTerm?.(query);
    goTo("jobs");
  };

  const handleLogout = () => {
    logout();
    goTo("home");
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <button className="navbar__brand" type="button" onClick={() => goTo("home")}>
          <span className="navbar__mark">HF</span>
          <span className="navbar__name">HireFlow</span>
        </button>

        <form className="navbar__search" onSubmit={handleSearch}>
          <Icon name="briefcase" />
          <input
            aria-label="Search jobs and people"
            placeholder="Search jobs and people"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" aria-label="Search">
            <Icon name="search" />
          </button>
        </form>

        <nav className="navbar__links" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              type="button"
              className={`navbar__link ${activePage === item.page ? "navbar__link--active" : ""}`}
              onClick={() => goTo(item.page)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="navbar__tools">
          <button className="navbar__icon-button" type="button" onClick={() => goTo("jobs")}>
            <Icon name="save" />
            {savedCount > 0 && <span className="navbar__badge">{savedCount}</span>}
          </button>
          <button className="navbar__icon-button" type="button" onClick={() => goTo("api-keys")}>
            <Icon name="key" />
          </button>
        </div>

        <div className="navbar__actions">
          <button className="btn btn--primary" type="button" onClick={() => goTo("post-job")}>
            Post job
          </button>

          {isAuthenticated ? (
            <>
              <button className="navbar__user" type="button" onClick={() => goTo("profile")}>
                <span>{user?.name?.slice(0, 1) || "H"}</span>
                <strong>{user?.name || "Account"}</strong>
              </button>
              <button className="btn btn--ghost" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--ghost" type="button" onClick={() => goTo("login")}>
                Login
              </button>
              <button className="btn btn--outline" type="button" onClick={() => goTo("signup")}>
                Join
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
