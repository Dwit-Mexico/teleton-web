import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AUTH_API_URL } from "../constants";

export type UserRole = "donor" | "admin";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: UserRole;
  primaryProvider: "google" | "apple";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  login: (provider: "google" | "apple") => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const stored = localStorage.getItem("refresh_token");
    if (!stored) {
      setAccessToken(null);
      setUser(null);
      return null;
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${stored}` },
      });

      if (!response.ok) {
        localStorage.removeItem("refresh_token");
        throw new Error("Refresh failed");
      }

      const data = await response.json();
      if (data.success && data.data) {
        if (data.data.refreshToken) {
          localStorage.setItem("refresh_token", data.data.refreshToken);
        }
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        return data.data.accessToken;
      }
      return null;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
        }
      }
    } catch {
      console.error("Failed to fetch user");
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      // Check for callback with access token in URL fragment
      const hash = window.location.hash;
      if (hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        const refresh = params.get("refresh_token");
        if (token) {
          if (refresh) {
            localStorage.setItem("refresh_token", refresh);
          }
          setAccessToken(token);
          await fetchCurrentUser(token);
          // Clean up URL
          window.history.replaceState(null, "", window.location.pathname);
        }
        setIsLoading(false);
        return;
      }

      // Try to refresh existing session
      const token = await refreshAccessToken();
      if (token) {
        await fetchCurrentUser(token);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser, refreshAccessToken]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!accessToken) return;

    // Refresh 5 minutes before expiration (token lasts 60 min)
    const refreshInterval = setInterval(
      async () => {
        await refreshAccessToken();
      },
      55 * 60 * 1000
    ); // 55 minutes

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshAccessToken]);

  const login = (provider: "google" | "apple") => {
    const tenant = window.location.hostname;
    window.location.href = `${AUTH_API_URL}/auth/${provider}?tenant=${encodeURIComponent(tenant)}`;
  };

  const logout = async () => {
    const stored = localStorage.getItem("refresh_token");
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: "POST",
        headers: stored ? { Authorization: `Bearer ${stored}` } : undefined,
      });
    } finally {
      localStorage.removeItem("refresh_token");
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        accessToken,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
