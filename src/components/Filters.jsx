import React from "react";

function Filters({
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className="filters">

      <select
        value={selectedCategory}
        onChange={(e) =>
          setSelectedCategory(e.target.value)
        }
      >
        <option value="">All Categories</option>

        <option value="Frontend">
          Frontend
        </option>

        <option value="Backend">
          Backend
        </option>

        <option value="Fullstack">
          Fullstack
        </option>

        <option value="UI/UX">
          UI/UX
        </option>
      </select>

    </div>
  );
}

export default Filters;