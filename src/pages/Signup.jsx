import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function SignupIcon() {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <line x1="12" y1="12" x2="12" y2="18" />
      <line x1="9" y1="15" x2="15" y2="15" />
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

function SignupPage({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState("candidate");
  const [errors, setErrors] = useState({});
  const { signup, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors = {};

    if (!fullName) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signup(email, password, fullName, userType);
      onNavigate("home");
    } catch {
      // Error is handled by context
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div
        style={{
          maxWidth: 480,
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
              color: "var(--cyan)",
            }}
          >
            <SignupIcon />
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
            Create Account
          </h1>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
            Join HireFlow to post jobs or find opportunities
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text2)",
                display: "block",
                marginBottom: 7,
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: undefined });
              }}
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                background: "var(--surface2)",
                border: `1.5px solid ${errors.fullName ? "var(--red)" : "var(--border2)"}`,
                borderRadius: "var(--r-md)",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = errors.fullName ? "var(--red)" : "var(--violet)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors.fullName ? "var(--red)" : "var(--border2)")
              }
            />
            {errors.fullName && (
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
                <ErrorIcon /> {errors.fullName}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
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

          <div style={{ marginBottom: 16 }}>
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

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text2)",
                display: "block",
                marginBottom: 7,
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: undefined });
              }}
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                background: "var(--surface2)",
                border: `1.5px solid ${errors.confirmPassword ? "var(--red)" : "var(--border2)"}`,
                borderRadius: "var(--r-md)",
                color: "var(--text)",
                fontSize: 14,
                outline: "none",
                transition: "border-color .2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = errors.confirmPassword ? "var(--red)" : "var(--violet)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors.confirmPassword ? "var(--red)" : "var(--border2)")
              }
            />
            {errors.confirmPassword && (
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
                <ErrorIcon /> {errors.confirmPassword}
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
                marginBottom: 10,
              }}
            >
              I am a:
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { value: "candidate", label: "Job Seeker", icon: "👤" },
                { value: "recruiter", label: "Recruiter", icon: "🏢" },
                { value: "admin", label: "Admin", icon: "▣" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUserType(option.value)}
                  style={{
                    flex: 1,
                    padding: "12px 14px",
                    background:
                      userType === option.value ? "var(--violet)" : "var(--surface2)",
                    color: userType === option.value ? "white" : "var(--text2)",
                    border: `1.5px solid ${
                      userType === option.value ? "var(--violet)" : "var(--border2)"
                    }`,
                    borderRadius: "var(--r-md)",
                    cursor: "pointer",
                    transition: "all .2s",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
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
            {isLoading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text2)" }}>
          Already have an account?{" "}
          <button
            onClick={() => onNavigate("login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--violet)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "inherit",
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
