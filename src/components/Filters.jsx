// src/components/Filters.jsx

const CATEGORIES = [
  { value: "All",          label: "All Jobs" },
  { value: "software-dev", label: "Software Dev" },
  { value: "data",         label: "Data & AI" },
  { value: "mobile",       label: "Mobile" },
  { value: "devops",       label: "DevOps" },
  { value: "design",       label: "Design" },
];

function Filters({ filterType, setFilterType, activeCategory, setActiveCategory, totalCount }) {
  return (
    <div className="controls">
      <span className="controls__label">Filter:</span>

      <div className="controls__pills">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            className={`pill ${activeCategory === value ? "pill--active" : ""}`}
            onClick={() => setActiveCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <select
        className="controls__select"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        aria-label="Filter by job type"
      >
        <option value="">All Types</option>
        <option value="full-time">Full-time</option>
        <option value="contract">Contract</option>
        <option value="part-time">Part-time</option>
        <option value="freelance">Freelance</option>
      </select>

      {totalCount !== undefined && (
        <span className="controls__count">{totalCount} result{totalCount !== 1 ? "s" : ""}</span>
      )}
    </div>
  );
}

export default Filters;