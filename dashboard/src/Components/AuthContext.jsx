import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const res = await api.get("/auth/me");
    setUser(res.data?.user || null);
    setStats(res.data?.stats || null);
    return res.data;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("finsprint_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        await refreshProfile();
      } catch (error) {
        localStorage.removeItem("finsprint_token");
        setUser(null);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("finsprint_token", res.data.token);
    setUser(res.data.user);
    await refreshProfile();
  };

  const register = async (fullName, email, password) => {
    const res = await api.post("/auth/register", { fullName, email, password });
    localStorage.setItem("finsprint_token", res.data.token);
    setUser(res.data.user);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem("finsprint_token");
    setUser(null);
    setStats(null);
  };

  const value = useMemo(
    () => ({
      user,
      stats,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, stats, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

