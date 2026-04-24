import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AuthBackground from "./AuthBackground";
import "./AuthPage.css"; // Ensure you import the CSS file!

const AuthPage = () => {
  const { isAuthenticated, login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(fullName, email, password);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBackground />
      
      <div className="auth-container">
        <div className="auth-card glass-effect">
          <div className="auth-header">
            <h1 className="brand-title">FinSprint</h1>
            <h2>{isLoginMode ? "Welcome Back" : "Create Workspace"}</h2>
            <p>{isLoginMode ? "Access your trading dashboard" : "Start your stock trading journey today"}</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            {!isLoginMode && (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="input-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="loader"></span> : (isLoginMode ? "Secure Login" : "Create Account")}
            </button>
          </form>

          <div className="auth-footer">
            <button className="auth-switch-btn" onClick={() => setIsLoginMode((prev) => !prev)}>
              {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;