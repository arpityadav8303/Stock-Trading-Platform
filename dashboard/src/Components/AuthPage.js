import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

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
      setError(err?.response?.data?.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{isLoginMode ? "Login" : "Create Account"}</h1>
        <p>{isLoginMode ? "Welcome back to FinSprint" : "Start trading with your private workspace"}</p>

        <form onSubmit={onSubmit} className="auth-form">
          {!isLoginMode && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error ? <div className="auth-error">{error}</div> : null}

          <button className="btn btn-primary auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isLoginMode ? "Login" : "Register"}
          </button>
        </form>

        <button className="auth-switch" onClick={() => setIsLoginMode((prev) => !prev)}>
          {isLoginMode ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;

