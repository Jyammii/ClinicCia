import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

const AuthCtx = createContext(null);
const SiteCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
export const useSite = () => useContext(SiteCtx);

// Staff = any non-patient account. Admin always has every module.
export const can = (user, mod) => !!user && (user.role === "admin" || (user.role !== "patient" && user.permissions?.includes(mod)));
export const isStaff = (user) => !!user && user.role !== "patient";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getToken());

  useEffect(() => {
    if (!getToken()) return;
    api.get("/auth/me").then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);
  useEffect(() => {
    const expired = () => { setToken(null); setUser(null); };
    addEventListener("auth:expired", expired);
    return () => removeEventListener("auth:expired", expired);
  }, []);

  const finish = ({ token, user: u }) => { setToken(token); setUser(u); return u; };
  const login = async (email, password) => finish(await api.post("/auth/login", { email, password }));
  const register = async (name, email, password) => finish(await api.post("/auth/register", { name, email, password }));
  const logout = () => { setToken(null); setUser(null); location.hash = "/"; };

  return <AuthCtx.Provider value={{ user, ready, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(() => api.get("/site").then((s) => { setSite(s); setError(""); }).catch((e) => setError(e.message)), []);
  useEffect(() => { load(); }, [load]);
  return <SiteCtx.Provider value={{ site, error, reload: load, setSite }}>{children}</SiteCtx.Provider>;
}
