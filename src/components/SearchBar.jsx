// src/components/SearchBar.jsx

function SearchBar({ searchTerm, setSearchTerm, placeholder = "Search jobs, companies, skills…" }) {
  return (
    <div className="search-bar">
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