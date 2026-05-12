function Loader({
  label = "Loading HireFlow...",
  fullScreen = false,
  compact = false,
}) {
  const styles = `
    .loader {
      display: grid;
      place-items: center;
      width: 100%;
      padding: 2rem;
    }

    .loader--fullscreen {
      min-height: 100vh;
      background:
        radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.18), transparent 32%),
        linear-gradient(135deg, #0f1020 0%, #17142c 45%, #211b3f 100%);
    }

    .loader--compact {
      padding: 1rem;
    }

    .loader__card {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 1.5rem;
      background: rgba(24, 24, 38, 0.95);
      padding: 1rem 1.25rem;
      box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
    }

    .loader__mark {
      display: flex;
      align-items: end;
      gap: 0.25rem;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      padding: 0.65rem;
    }

    .loader__mark span {
      display: block;
      width: 0.38rem;
      border-radius: 999px;
      background: #ffffff;
      animation: hireflow-loader 0.85s ease-in-out infinite;
    }

    .loader__mark span:nth-child(1) {
      height: 45%;
    }

    .loader__mark span:nth-child(2) {
      height: 75%;
      animation-delay: 0.12s;
    }

    .loader__mark span:nth-child(3) {
      height: 55%;
      animation-delay: 0.24s;
    }

    .loader__content p {
      margin: 0;
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 900;
    }

    .loader__content small {
      display: block;
      margin-top: 0.15rem;
      color: #a8a5c7;
      font-size: 0.78rem;
      font-weight: 600;
    }

    @keyframes hireflow-loader {
      0%,
      100% {
        transform: scaleY(0.65);
        opacity: 0.65;
      }

      50% {
        transform: scaleY(1);
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .loader__mark span {
        animation: none;
      }
    }
  `;

  const loaderClasses = [
    "loader",
    fullScreen ? "loader--fullscreen" : "",
    compact ? "loader--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <style>{styles}</style>

      <div
        className={loaderClasses}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div className="loader__card">
          <div className="loader__mark" aria-hidden="true">
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
    </>
  );
}

export default Loader;