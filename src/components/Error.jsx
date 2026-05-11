// src/components/Error.jsx

function Error({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <div className="error-box__icon">⚠️</div>
      <h2 className="error-box__title">Failed to load jobs</h2>
      <p className="error-box__msg">
        {message || "We couldn't reach the API. Demo data is shown below. Check your connection and try again."}
      </p>
      {onRetry && <button className="error-box__retry" onClick={onRetry}>Try Again</button>}
    </div>
  );
}

export default Error;