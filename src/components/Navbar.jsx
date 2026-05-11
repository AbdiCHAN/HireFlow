// src/components/Navbar.jsx

function Navbar({ activePage, onNavigate, savedCount = 0 }) {
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
          <span className="navbar__cart">
            🛒
            <span className="navbar__cart-badge">0</span>
          </span>
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