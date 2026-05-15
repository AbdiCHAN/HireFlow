function Error({ message, onRetry }) {
  return (
    <div className="error-box">
      <div className="error-box__title">Failed to load jobs</div>
      <div className="error-box__msg">
        {message || "We couldn't reach the API. Demo data is shown below. Check your connection and try again."}
      </div>
      {onRetry && (
        <div
          className="error-box__retry"
          onClick={onRetry}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => { if (e.key === 'Enter') onRetry(); }}
        >
          Try Again
        </div>
      )}
    </div>
  );
}

export default Error;