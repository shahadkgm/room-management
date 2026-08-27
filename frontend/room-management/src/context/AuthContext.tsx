import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  switchUser: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const switchUser = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const email = targetRole === "admin" ? "admin@unani.com" : "receptionist@unani.com";
      const pass = targetRole === "admin" ? "admin" : "receptionist";
      const res = await api.login(email, pass);
      setUser(res.user);
      setToken(res.token);
    } catch (e) {
      console.error("Failed to switch role:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const me = await api.getMe();
          setUser(me);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("Auth token verification failed, clearing session:", err);
        api.setToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "receptionist",
        token,
        isLoading,
        login,
        switchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
