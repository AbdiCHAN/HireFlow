function SearchBar({ searchTerm, setSearchTerm, onSearch, userInitial = "H" }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.();
  };

  return (
    <section className="search-panel">
      <form className="search-panel__row" onSubmit={handleSubmit}>
        <div className="search-panel__avatar">{userInitial}</div>
        <input
          type="search"
          placeholder="Search jobs, companies, skills"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <div className="search-panel__quick">
        {["Engineering", "Design", "Marketing", "Management", "Finance"].map((item) => (
          <button key={item} type="button" onClick={() => setSearchTerm(item)}>
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

export default SearchBar;
