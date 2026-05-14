import { createContext, useContext, useCallback, useState, useEffect } from "react";
import { apiUrl, readApiError, TOKEN_KEY, USER_KEY } from "../services/api";

const AuthContext = createContext(undefined);

const LEGACY_TOKEN_KEY = "hireflow_auth_token";
const LEGACY_USER_KEY = "hireflow_user";

const roleForSignupType = (userType) => {
  if (userType === "recruiter") return "employer";
  if (userType === "admin") return "admin";
  return "job_seeker";
};

const persistSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored =
      localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LEGACY_USER_KEY);
        localStorage.removeItem(LEGACY_TOKEN_KEY);
      }
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Login failed"));
      }

      const data = await response.json();

      persistSession(data.token, data.user);
      setUser(data.user);

      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";

      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email, password, fullName, userType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: fullName,
          email,
          password,
          role: roleForSignupType(userType),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Signup failed"));
      }

      const data = await response.json();

      persistSession(data.token, data.user);
      setUser(data.user);

      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Signup failed. Please try again.";

      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
