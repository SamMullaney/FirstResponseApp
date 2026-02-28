import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface Agency {
  id: string;
  name: string;
  type: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  agency: Agency;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "Login failed");
    }

    const data = await res.json();
    setAuth({ token: data.token, user: data.user });
  }, []);

  const logout = useCallback(() => {
    setAuth({ token: null, user: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        user: auth.user,
        login,
        logout,
        isAuthenticated: auth.token !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
