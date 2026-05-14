import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function LoginIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { login, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(email, password);
      onNavigate("home");
    } catch {
      // Error is handled by context
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          borderRadius: "var(--r-xl)",
          padding: "40px",
          animation: "fadeUp .4s ease both",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "var(--surface2)",
              borderRadius: "var(--r-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--violet)",
            }}
          >
            <LoginIcon />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 800,
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            Welcome Back
          </h1>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
            Sign in to access your jobs and applications
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text2)",
                display: "block",
                marginBottom: 7,
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                background: "var(--surface2)",
                border: `1.5px solid ${errors.email ? "var(--red)" : "var(--border2)"}`,
                borderRadius: "var(--r-md)",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = errors.email ? "var(--red)" : "var(--violet)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors.email ? "var(--red)" : "var(--border2)")
              }
            />
            {errors.email && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--red)",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ErrorIcon /> {errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text2)",
                display: "block",
                marginBottom: 7,
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                background: "var(--surface2)",
                border: `1.5px solid ${errors.password ? "var(--red)" : "var(--border2)"}`,
                borderRadius: "var(--r-md)",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = errors.password ? "var(--red)" : "var(--violet)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors.password ? "var(--red)" : "var(--border2)")
              }
            />
            {errors.password && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--red)",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ErrorIcon /> {errors.password}
              </p>
            )}
          </div>

          {error && (
            <div
              style={{
                padding: 12,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--r-md)",
                marginBottom: 18,
                fontSize: 13,
                color: "var(--red)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ErrorIcon /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: 48,
              background: isLoading ? "var(--border2)" : "var(--violet)",
              color: "white",
              border: "none",
              borderRadius: "var(--r-md)",
              fontSize: 15,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background .2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text2)" }}>
          Don't have an account?{" "}
          <button
            onClick={() => onNavigate("signup")}
            style={{
              background: "none",
              border: "none",
              color: "var(--violet)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "inherit",
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
