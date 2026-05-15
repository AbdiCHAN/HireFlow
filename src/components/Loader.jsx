import "./Loader.css";

// Creates the Loader component
function Loader({
  label = "Loading HireFlow...",
  fullScreen = false,
  compact = false,
}) {
  const loaderClasses = [
    "loader",
    fullScreen ? "loader--fullscreen" : "",
    compact ? "loader--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={loaderClasses}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="loader__card">
        <div className="loader__mark" aria-hidden="true">
          <div className="loader__bar" />
          <div className="loader__bar" />
          <div className="loader__bar" />
        </div>

        {!compact && <p className="loader__label">{label}</p>}
      </div>
    </div>
  );
}

export default Loader;
