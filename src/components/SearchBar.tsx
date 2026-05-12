// src/components/SearchBar.jsx

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function SearchBar({ searchTerm, setSearchTerm, placeholder = "Search jobs, companies, skills…" }) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon"><SearchIcon /></span>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search jobs"
      />
    </div>
  );
}

export default SearchBar;