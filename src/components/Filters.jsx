import React from "react";

function Filters({ filterType, setFilterType }) {
  return (
    <div className="filters">
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
      >
        <option value="">All Jobs</option>
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
        <option value="fullstack">Fullstack</option>
      </select>
    </div>
  );
}

export default Filters;