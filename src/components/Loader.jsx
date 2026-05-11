import "./Loader.css";

function Loader({
  label = "Loading HireFlow...",
  fullScreen = false,
  compact = false,
}) {
  return (
    <div
      className={[
        "loader",
        fullScreen ? "loader--fullscreen" : "",
        compact ? "loader--compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="loader__card">
        <div className="loader__mark">
          <span />
          <span />
          <span />
        </div>

        {!compact && (
          <div className="loader__content">
            <p>{label}</p>
            <small>Please wait a moment</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default Loader;