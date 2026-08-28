import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MarkazEmblem } from "./MarkazLogo";
import "./LoginPage.css";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setErrorMsg("Please enter username/email and password.");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      await login(usernameOrEmail, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Logo Badge */}
        <div className="login-header">
          <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "12px" }}>
            <MarkazEmblem size={64} strokeColor="#0d9488" goldColor="#D49B3A" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.15, marginBottom: "8px" }}>
            <div style={{ display: "flex", gap: "6px", fontSize: "24px", fontWeight: 800, letterSpacing: "0.08em", color: "#0f172a" }}>
              <span>MARKAZ</span>
              <span style={{ color: "#D49B3A" }}>UNANI</span>
              <span>HOSPITAL</span>
            </div>
          </div>
          <p className="login-subtitle">Room allocation & Patient management workspace</p>
        </div>

        {/* Card */}
        <div className="login-card">
          {errorMsg && (
            <div className="login-error-alert">
              <span className="error-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username-email">Username or Email</label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  id="username-email"
                  type="text"
                  placeholder="admin, receptionist, or visitor"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
