import { useState } from "react";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import AuthScene from "./AuthScene";
import "./AuthPage.css";

export default function AuthPage() {
  const { login, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <AuthScene />

      <div className="ui">
        {/* Decorative Floating Symbols */}
        <div className="floating-symbols">
          <span className="symbol s1">₹</span>
          <span className="symbol s2">$</span>
          <span className="symbol s3">₹</span>
          <span className="symbol s4">$</span>
        </div>

        <div className="left">
          <div className="brand-badge">ESTD 2026</div>
          <h1>FinSprint</h1>
          <div className="tagline-container">
            <div className="tagline-line"></div>
            <p>Dalal Street's Modern Edge</p>
          </div>
        </div>

        <div className="right">
          <div className="auth-glass-card">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-header">
                <h2>{mode === "login" ? "Welcome Back" : "Open Account"}</h2>
                <div className="market-status">
                  <span className="dot"></span> LIVE MARKET ACCESS
                </div>
              </div>

              {mode === "signup" && (
                <div className="field">
                  <input
                    id="name"
                    required
                    placeholder=" "
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                  <label htmlFor="name">Full Name</label>
                  <span className="field-icon">👤</span>
                </div>
              )}

              <div className="field">
                <input
                  id="email"
                  required
                  type="email"
                  placeholder=" "
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
                <label htmlFor="email">Email Address</label>
                <span className="field-icon">📧</span>
              </div>

              <div className="field">
                <input
                  id="password"
                  required
                  type="password"
                  placeholder=" "
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <label htmlFor="password">Security Password</label>
                <span className="field-icon">🔒</span>
              </div>

              <button type="submit" className="submit-btn">
                <span className="btn-text">
                  {loading
                    ? "COMMUNICATING..."
                    : mode === "login"
                    ? "SIGN IN TO TERMINAL"
                    : "EXECUTE SIGN UP"}
                </span>
                <span className="btn-glow"></span>
              </button>

              <div className="form-footer">
                <p onClick={() =>
                  setMode(mode === "login" ? "signup" : "login")
                }>
                  {mode === "login"
                    ? "New to the street? Open account →"
                    : "Already registered? Access terminal →"}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}