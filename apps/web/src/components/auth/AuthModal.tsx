import React, { useState } from "react";
import { X, Lock, Mail, Building, User, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { useApp } from "../../context/AppContext.js";

export const AuthModal: React.FC = () => {
  const { authModal, setAuthModal, login, register } = useApp();

  const [mode, setMode] = useState<"login" | "register">(authModal || "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regOrgName, setRegOrgName] = useState("");
  const [regOrgSlug, setRegOrgSlug] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Keep modal mode in sync if opened via context
  React.useEffect(() => {
    if (authModal) {
      setMode(authModal);
      setError(null);
    }
  }, [authModal]);

  if (!authModal) return null;

  const handleOrgNameChange = (val: string) => {
    setRegOrgName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setRegOrgSlug(slug);
  };

  const handleFillDemo = () => {
    setLoginEmail("operator@noroshi.internal");
    setLoginPassword("password123");
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setError("Please provide your email address.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await login(loginEmail, loginPassword || undefined);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Login failed. Check your credentials.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regOrgName || !regOrgSlug) {
      setError("All fields marked * are required.");
      return;
    }
    setError(null);
    setLoading(true);

    const res = await register({
      name: regName,
      email: regEmail,
      organizationName: regOrgName,
      organizationSlug: regOrgSlug,
      password: regPassword || undefined,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Registration failed. Try again.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 7, 9, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={() => setAuthModal(null)}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 32,
          position: "relative",
          animation: "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          background: "linear-gradient(145deg, rgba(26, 30, 36, 0.95), rgba(18, 21, 25, 0.98))",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModal(null)}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3D87FF, #225BFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgba(61, 135, 255, 0.35)",
            }}
          >
            <ShieldCheck size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
            {mode === "login" ? "Sign In to Noroshi" : "Create Organization Workspace"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {mode === "login"
              ? "Access status pages, incident workflows & telemetry feeds"
              : "Set up multi-tenant incident management in seconds"}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            background: "rgba(0, 0, 0, 0.35)",
            padding: 4,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: mode === "login" ? "#3D87FF" : "transparent",
              color: mode === "login" ? "#fff" : "var(--text-secondary)",
              boxShadow: mode === "login" ? "0 4px 12px rgba(61, 135, 255, 0.3)" : "none",
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: mode === "register" ? "#3D87FF" : "transparent",
              color: mode === "register" ? "#fff" : "var(--text-secondary)",
              boxShadow: mode === "register" ? "0 4px 12px rgba(61, 135, 255, 0.3)" : "none",
            }}
          >
            Create Organization
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#FCA5A5",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: "0.82rem",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form: Login */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                Work Email <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  className="input-field"
                  placeholder="operator@company.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                Password (optional for demo)
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 6,
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(61, 135, 255, 0.08)",
                border: "1px dashed rgba(61, 135, 255, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={14} color="#3D87FF" />
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Quick Test Account</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#3D87FF",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                Auto-fill
              </button>
            </div>
          </form>
        )}

        {/* Form: Register */}
        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Your Name <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Sagarika"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Work Email <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                  />
                  <input
                    type="email"
                    className="input-field"
                    placeholder="ops@acme.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{ paddingLeft: 38 }}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                Organization Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Building
                  size={16}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Acme Global Inc"
                  value={regOrgName}
                  onChange={(e) => handleOrgNameChange(e.target.value)}
                  style={{ paddingLeft: 38 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                Organization Slug <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="acme-global"
                value={regOrgSlug}
                onChange={(e) => setRegOrgSlug(e.target.value)}
                required
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                Used in multi-tenant URLs and team identification.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                Password (optional)
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 6,
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Organization & Start</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
