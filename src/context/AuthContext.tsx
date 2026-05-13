import { createContext, useContext, useCallback, useState, useEffect } from "react";
import { apiUrl, readApiError, TOKEN_KEY, USER_KEY } from "../services/api";

type Role = "job_seeker" | "employer" | "admin";
type SignupType = "recruiter" | "candidate" | "admin";

interface User {
  id: number;
  email: string;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    userType: SignupType
  ) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LEGACY_TOKEN_KEY = "hireflow_auth_token";
const LEGACY_USER_KEY = "hireflow_user";

const roleForSignupType = (userType: SignupType): Role => {
  if (userType === "recruiter") return "employer";
  if (userType === "admin") return "admin";
  return "job_seeker";
};

const persistSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
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

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "Login failed"));
      }

      const data = await response.json();
      persistSession(data.token, data.user);
      setUser(data.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      userType: SignupType
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl("/api/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Signup failed. Please try again.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
