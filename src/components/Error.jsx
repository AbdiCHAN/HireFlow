// src/components/Error.jsx

function Error({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <div className="error-box__icon">⚠️</div>
      <h2 className="error-box__title">Something went wrong</h2>
      <p className="error-box__msg">
        {message || "We couldn't load jobs. Showing demo data instead."}
      </p>
      {onRetry && (
        <button className="error-box__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default Error;