// src/components/Navbar.jsx

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function Navbar({ activePage = "home", onNavigate = () => {}, savedCount = 0 }) {
  const links = [
    { key:"home",       label:"Home" },
    { key:"about",      label:"About" },
    { key:"jobs",       label:"Jobs" },
    { key:"categories", label:"Category" },
    { key:"candidates", label:"Candidates" },
    { key:"news",       label:"News" },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Logo — HireFlow */}
        <button className="navbar__logo" onClick={() => onNavigate("home")}>
          <div className="navbar__logo-mark">◫</div>
          HireFlow
        </button>

        {/* Nav links */}
        <div className="navbar__links">
          {links.map(({ key, label }) => (
            <button
              key={key}
              className={`navbar__link ${activePage === key ? "navbar__link--active" : ""}`}
              onClick={() => onNavigate(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          <button
            className="navbar__saved"
            onClick={() => onNavigate("jobs")}
            aria-label={`${savedCount} saved jobs`}
          >
            <HeartIcon />
            <span className="navbar__saved-badge">{savedCount}</span>
          </button>
          <button className="btn btn--primary" onClick={() => onNavigate("post-job")}>
            Job Post
          </button>
          <button className="btn btn--outline" onClick={() => onNavigate("cv-post")}>
            CV Post
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
