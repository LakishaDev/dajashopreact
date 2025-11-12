import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  function showAuth(nextMode = "login") {
    setMode(nextMode);
    setAuthOpen(true);
  }
  function hideAuth() {
    setAuthOpen(false);
  }

  async function login({ email, password }) {
    // TODO: zameniti pravim API pozivom
    await new Promise((r) => setTimeout(r, 400));
    const name = email.split("@")[0];
    setUser({ id: crypto.randomUUID(), name, email });
  }

  async function register({ name, email, password }) {
    // TODO: zameniti pravim API pozivom
    await new Promise((r) => setTimeout(r, 500));
    setUser({ id: crypto.randomUUID(), name, email });
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      authOpen,
      showAuth,
      hideAuth,
      mode,
      setMode,
    }),
    [user, authOpen, mode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
