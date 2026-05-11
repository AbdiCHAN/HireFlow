// src/components/Filters.jsx

const CATEGORIES = [
  { value:"All",         label:"View all" },
  { value:"digital",     label:"Digital" },
  { value:"engineering", label:"Engineering" },
  { value:"management",  label:"Management" },
  { value:"finance",     label:"Finance" },
  { value:"marketing",   label:"Marketing" },
  { value:"design",      label:"Design" },
  { value:"development", label:"Development" },
];

const JOB_TYPES = [
  { value:"",          label:"All Types" },
  { value:"full-time", label:"Full-time" },
  { value:"contract",  label:"Contract" },
  { value:"part-time", label:"Part-time" },
  { value:"remote",    label:"Remote" },
  { value:"freelance", label:"Freelance" },
];

function Filters({ filterType, setFilterType, activeCategory, setActiveCategory }) {
  return (
    <div className="jobs-filter">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          className={`filter-pill ${
            activeCategory === value
              ? value === "All" ? "filter-pill--view-all" : "filter-pill--active"
              : ""
          }`}
          onClick={() => setActiveCategory(value)}
        >
          {label}
        </button>
      ))}

      <select
        className="jobs-filter__select"
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        aria-label="Filter by job type"
      >
        {JOB_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}

export default Filters;
