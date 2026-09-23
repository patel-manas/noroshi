import React from "react";
import { Activity, ExternalLink } from "lucide-react";
import { useApp } from "../../context/AppContext.js";

export const PreviewTab: React.FC = () => {
  const { selectedPage } = useApp();

  if (!selectedPage) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
        No page selected for preview.
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "12px 20px",
          background: "var(--bg-surface-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={16} color="#3D87FF" />
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
            Live SSR Status Page (/status/{selectedPage.slug})
          </span>
        </div>
        <a
          href={`/status/${selectedPage.slug}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
        >
          <ExternalLink size={14} />
          Open In New Tab
        </a>
      </div>
      <iframe
        src={`/status/${selectedPage.slug}`}
        style={{
          width: "100%",
          height: 700,
          border: "none",
          background: "#0A0C0E",
        }}
        title="Status Page Preview"
      />
    </div>
  );
};
