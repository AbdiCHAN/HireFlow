import "./Loader.css";

function Loader({ compact = false, fullscreen = false, label = "Loading jobs" }) {
  const className = [
    "loader",
    compact ? "loader--compact" : "",
    fullscreen ? "loader--fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} role="status" aria-live="polite">
      <div className="loader__card">
        <div className="loader__mark" aria-hidden="true">
          <span className="loader__bar" />
          <span className="loader__bar" />
          <span className="loader__bar" />
        </div>
        <p className="loader__label">{label}</p>
      </div>
    </div>
  );
}

export default Loader;
