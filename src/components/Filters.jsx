const CATEGORIES = [
  "All",
  "digital",
  "engineering",
  "management",
  "finance",
  "marketing",
  "design",
  "development",
];

const TYPES = ["All Types", "remote", "full-time", "contract", "part-time", "freelance"];

function labelFor(value) {
  if (value === "All") return "View all";
  if (value === "All Types") return value;

  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Filters({ selectedCategory, setSelectedCategory, selectedType, setSelectedType }) {
  return (
    <section className="filters" aria-label="Job filters">
      <div className="filters__chips">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? "is-active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {labelFor(category)}
          </button>
        ))}
      </div>

      <select
        aria-label="Filter by job type"
        value={selectedType}
        onChange={(event) => setSelectedType(event.target.value)}
      >
        {TYPES.map((type) => (
          <option key={type} value={type}>
            {labelFor(type)}
          </option>
        ))}
      </select>
    </section>
  );
}

export default Filters;
