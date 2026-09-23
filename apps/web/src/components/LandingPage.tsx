import React from "react";
import {
  Radio,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Bell,
} from "lucide-react";
import { useApp } from "../context/AppContext.js";

export const LandingPage: React.FC = () => {
  const { setAuthModal } = useApp();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
      <div className="ambient-glow" />

      {/* Top Navigation */}
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          padding: "16px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(18, 21, 25, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* Brand Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #3D87FF, #225BFF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(61, 135, 255, 0.4)",
              }}
            >
              <Radio size={18} color="#fff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "0.06em", color: "#fff" }}>
                NOROSHI
              </span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
                INCIDENT PLATFORM
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a
              href="#features"
              style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              Features
            </a>
            <a
              href="#architecture"
              style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              Architecture
            </a>
            <a
              href="/status/main-status"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#3D87FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              <span>Live Status Page</span>
              <ExternalLink size={12} />
            </a>
          </nav>
        </div>

        {/* Auth CTA Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setAuthModal("login")}
            className="btn btn-secondary"
            style={{ padding: "8px 18px", fontSize: "0.85rem" }}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModal("register")}
            className="btn btn-primary"
            style={{
              padding: "8px 20px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(61, 135, 255, 0.35)",
            }}
          >
            <span>Create Organization</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: "80px 24px 60px", maxWidth: 1140, margin: "0 auto", textAlign: "center", position: "relative" }}>
        {/* Pulsating Pill Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(61, 135, 255, 0.1)",
            border: "1px solid rgba(61, 135, 255, 0.3)",
            marginBottom: 24,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3D87FF", boxShadow: "0 0 8px #3D87FF" }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#93C5FD", letterSpacing: "0.02em" }}>
            Next-Gen Incident Coordination & Public Status Pages
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 22,
          }}
        >
          Declare. Coordinate. <br />
          <span
            style={{
              background: "linear-gradient(135deg, #60A5FA, #3D87FF, #818CF8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Communicate with Confidence.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-secondary)",
            maxWidth: 720,
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          An enterprise-grade modular incident management platform. Enforce finite state machine
          lifecycle transitions, ingest deduplicated telemetry, and serve ultra-fast SSR public status pages.
        </p>

        {/* Hero CTA Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
          <button
            onClick={() => setAuthModal("register")}
            className="btn btn-primary"
            style={{
              padding: "14px 28px",
              fontSize: "1rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 24px rgba(61, 135, 255, 0.4)",
            }}
          >
            <span>Start Free for Your Organization</span>
            <ArrowRight size={18} />
          </button>

          <a
            href="/status/main-status"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{
              padding: "14px 26px",
              fontSize: "1rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <Activity size={16} color="#10B981" />
            <span>Explore Public SSR Page</span>
            <ExternalLink size={14} color="var(--text-muted)" />
          </a>
        </div>

        {/* Interactive Showcase Preview */}
        <div
          className="glass-card"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "24px",
            textAlign: "left",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 32px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(61, 135, 255, 0.15)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Top Window Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 16,
              marginBottom: 20,
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 12 }}>
                noroshi.internal / manage / demo-cloud
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="badge badge-operational">99.98% 90-Day Uptime</span>
              <span className="badge badge-sev2">1 Active Incident</span>
            </div>
          </div>

          {/* Operational Banner */}
          <div
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              borderRadius: 10,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle2 size={20} color="#10B981" />
              <div>
                <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#A7F3D0" }}>
                  All Critical Services Operational
                </span>
                <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  Automated telemetry monitoring across all regions and clusters.
                </span>
              </div>
            </div>
            <button
              onClick={() => setAuthModal("login")}
              className="btn btn-secondary"
              style={{ padding: "6px 14px", fontSize: "0.78rem" }}
            >
              Manage Systems
            </button>
          </div>

          {/* Components Grid Preview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>API Gateway Ingress</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Edge proxies & TLS termination</div>
              </div>
              <span className="badge badge-operational">Operational</span>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Payment Processing</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Stripe & Banking webhooks</div>
              </div>
              <span className="badge badge-operational">Operational</span>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Database Cluster</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PostgreSQL Primary + Replicas</div>
              </div>
              <span className="badge badge-operational">Operational</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Engineered for High-Reliability Operations
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: 600, margin: "0 auto" }}>
            Everything modern engineering organizations need to detect outages, align response teams, and publish real-time status.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
          {/* Feature 1 */}
          <div className="glass-card" style={{ padding: 28, transition: "transform 0.2s ease" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(61, 135, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Zap size={22} color="#3D87FF" />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>Instant Public SSR Pages</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Rendered on the server with Fastify & EJS. Delivers instantaneous page loads, zero client-bundle lag, and resilient uptime during traffic surges.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card" style={{ padding: 28, transition: "transform 0.2s ease" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <GitBranch size={22} color="#10B981" />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>Enforced State Machine</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Strict lifecycle rules guarantee valid transitions: Triggered &rarr; Investigating &rarr; Resolved. Resolving incidents automatically restores linked component statuses.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card" style={{ padding: 28, transition: "transform 0.2s ease" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(245, 158, 11, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <Bell size={22} color="#F59E0B" />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>Alert Deduplication Engine</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Built-in Redis and PostgreSQL idempotency handles alert storms from Datadog, Prometheus, and CloudWatch without creating duplicate incident noise.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card" style={{ padding: 28, transition: "transform 0.2s ease" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(129, 140, 248, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <ShieldCheck size={22} color="#818CF8" />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>Multi-Tenant RBAC</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Hierarchical role-based access control across organizations, status pages, component groups, and operators. Safe isolation for all customer data.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Showcase */}
      <section
        id="architecture"
        style={{
          padding: "70px 24px",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(18, 21, 25, 0.5)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 12 }}>
            Clean Modular Monolith Architecture
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: 640, margin: "0 auto 40px" }}>
            Built with strict domain separation in Node.js, Fastify, TypeScript, PostgreSQL, and Redis.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              textAlign: "left",
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: "0.75rem", color: "#3D87FF", fontWeight: 700, textTransform: "uppercase" }}>01. Ingestion</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: 4, marginBottom: 6 }}>Webhooks & API</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Idempotent dedupe keys & fast JSON validation</div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 700, textTransform: "uppercase" }}>02. Event Bus</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: 4, marginBottom: 6 }}>Domain Events</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Asynchronous pub/sub on Redis channels</div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: "0.75rem", color: "#F59E0B", fontWeight: 700, textTransform: "uppercase" }}>03. Core Engine</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: 4, marginBottom: 6 }}>State Machine</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Strict validation and component linkage rules</div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: "0.75rem", color: "#818CF8", fontWeight: 700, textTransform: "uppercase" }}>04. Public Layer</div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginTop: 4, marginBottom: 6 }}>Fastify SSR</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Lightweight EJS templates served in under 20ms</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: "80px 24px", textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 16 }}>
          Ready to Elevate Your Incident Communication?
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: 32 }}>
          Create an organization in seconds or sign in with your team credentials.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
          <button
            onClick={() => setAuthModal("register")}
            className="btn btn-primary"
            style={{ padding: "12px 28px", fontSize: "0.95rem", fontWeight: 600 }}
          >
            Create Organization Workspace
          </button>
          <button
            onClick={() => setAuthModal("login")}
            className="btn btn-secondary"
            style={{ padding: "12px 24px", fontSize: "0.95rem" }}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--border-subtle)",
          padding: "24px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(10, 12, 16, 0.9)",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Radio size={14} color="#3D87FF" />
          <span>NOROSHI &copy; 2026. All rights reserved. Astryx Design Tokenized.</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="/status/main-status" target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
            Demo Status Page
          </a>
          <span style={{ cursor: "pointer" }} onClick={() => setAuthModal("login")}>
            Sign In
          </span>
        </div>
      </footer>
    </div>
  );
};
