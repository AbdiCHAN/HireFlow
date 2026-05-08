// src/components/Navbar.jsx
import { useState } from "react";
import SearchBar from "./SearchBar";

function Navbar({ searchTerm, setSearchTerm, savedCount = 0, onHomeClick, onSavedClick }) {
  const [active, setActive] = useState("home");

  const nav = [
    { key: "home",   label: "Home",      icon: HomeIcon,    onClick: onHomeClick },
    { key: "jobs",   label: "Jobs",      icon: BriefcaseIcon },
    { key: "saved",  label: "Saved",     icon: BookmarkIcon, onClick: onSavedClick, badge: savedCount },
    { key: "alerts", label: "Alerts",    icon: BellIcon },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <a className="navbar__logo" href="#" onClick={(e)=>{e.preventDefault();onHomeClick?.();}}>
          <div className="navbar__logo-mark">H</div>
          HireFlow
        </a>

        {/* Inline search */}
        <div className="navbar__search">
          <div className="navbar__search-wrap">
            <span className="navbar__search-icon">
              <SearchIcon />
            </span>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              placeholder="Search jobs…" />
          </div>
        </div>

        {/* Nav items */}
        <div className="navbar__nav">
          {nav.map(({ key, label, icon: Icon, onClick, badge }) => (
            <button
              key={key}
              className={`navbar__nav-item ${active === key ? "navbar__nav-item--active" : ""}`}
              onClick={() => { setActive(key); onClick?.(); }}
            >
              <Icon />
              <span>{label}</span>
              {badge > 0 && <span className="navbar__badge">{badge}</span>}
            </button>
          ))}
          <div className="navbar__avatar">A</div>
        </div>
      </div>
    </nav>
  );
}

/* ── inline SVGs ── */
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function BriefcaseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}
function BookmarkIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function BellIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}

export default Navbar;