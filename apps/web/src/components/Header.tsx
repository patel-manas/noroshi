import React from "react";
import { Radio, Server, Layers, ExternalLink, Plus, LogOut, User as UserIcon } from "lucide-react";
import { useApp } from "../context/AppContext.js";

export const Header: React.FC = () => {
  const { org, pages, selectedPage, selectPage, setShowNewPageModal, currentUser, logout } = useApp();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        padding: "14px 28px",
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
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #225BFF 0%, #3D87FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(61, 135, 255, 0.4)",
            }}
          >
            <Radio size={18} color="#fff" />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>NOROSHI</span>
            <span
              style={{
                fontSize: "0.65rem",
                marginLeft: 6,
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(61, 135, 255, 0.15)",
                color: "#3D87FF",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Manage Portal
            </span>
          </div>
        </div>

        {/* Tenant Selectors */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              background: "var(--bg-surface-elevated)",
              border: "1px solid var(--border-medium)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Server size={14} color="var(--text-muted)" />
            <span style={{ color: "var(--text-muted)" }}>Org:</span>
            <span style={{ fontWeight: 600 }}>{org?.name || "Loading..."}</span>
          </div>

          {selectedPage && (
            <div
              style={{
                background: "var(--bg-surface-elevated)",
                border: "1px solid var(--border-medium)",
                borderRadius: 8,
                padding: "4px 8px",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Layers size={14} color="var(--text-muted)" />
              <span style={{ color: "var(--text-muted)" }}>Page:</span>
              <select
                value={selectedPage.id}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setShowNewPageModal(true);
                    return;
                  }
                  const p = pages.find((item) => item.id === e.target.value);
                  if (p) selectPage(p);
                }}
                style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "none",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: "var(--bg-surface)" }}>
                    {p.name}
                  </option>
                ))}
                <option value="__new__" style={{ background: "var(--bg-surface-elevated)", color: "#3D87FF" }}>
                  + Create New Page...
                </option>
              </select>
            </div>
          )}

          <button
            onClick={() => setShowNewPageModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px" }}
            title="Create a new status page"
          >
            <Plus size={14} />
            New Page
          </button>
        </div>
      </div>

      {/* Header Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {selectedPage && (
          <a
            href={`/status/${selectedPage.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <ExternalLink size={14} />
            View Public Status Page
          </a>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.8rem",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#10B981",
            padding: "4px 10px",
            borderRadius: 9999,
            fontWeight: 500,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
          API Connected
        </div>

        {/* User Profile Pill & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderLeft: "1px solid var(--border-subtle)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: "0.82rem",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              padding: "4px 10px",
              borderRadius: 8,
            }}
          >
            <UserIcon size={14} color="#3D87FF" />
            <span style={{ fontWeight: 600 }}>{currentUser?.name || "Operator"}</span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", color: "#F87171" }}
            title="Log out of organization"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
