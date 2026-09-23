import React from "react";
import { ShieldAlert, Layers, Zap, Activity, Plus } from "lucide-react";
import { useApp } from "../context/AppContext.js";

export const TabsNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    incidents,
    setShowNewIncidentModal,
    setShowNewGroupModal,
    setShowNewCompModal,
  } = useApp();

  const activeIncidentsCount = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 12,
          padding: 4,
          gap: 4,
        }}
      >
        <button
          onClick={() => setActiveTab("incidents")}
          className={`btn btn-sm ${activeTab === "incidents" ? "btn-primary" : "btn-ghost"}`}
          style={{ borderRadius: 8, padding: "7px 16px" }}
        >
          <ShieldAlert size={15} />
          Incidents
          {activeIncidentsCount > 0 && (
            <span
              style={{
                marginLeft: 6,
                padding: "1px 6px",
                borderRadius: 999,
                background: "rgba(239, 68, 68, 0.2)",
                color: "#EF4444",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              {activeIncidentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("components")}
          className={`btn btn-sm ${activeTab === "components" ? "btn-primary" : "btn-ghost"}`}
          style={{ borderRadius: 8, padding: "7px 16px" }}
        >
          <Layers size={15} />
          Components & Groups
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`btn btn-sm ${activeTab === "alerts" ? "btn-primary" : "btn-ghost"}`}
          style={{ borderRadius: 8, padding: "7px 16px" }}
        >
          <Zap size={15} />
          Alert Ingestion Feed
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`btn btn-sm ${activeTab === "preview" ? "btn-primary" : "btn-ghost"}`}
          style={{ borderRadius: 8, padding: "7px 16px" }}
        >
          <Activity size={15} />
          Status Page Preview
        </button>
      </div>

      {activeTab === "incidents" && (
        <button onClick={() => setShowNewIncidentModal(true)} className="btn btn-primary">
          <Plus size={16} />
          Declare Incident
        </button>
      )}

      {activeTab === "components" && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowNewGroupModal(true)} className="btn btn-secondary">
            <Plus size={16} />
            New Component Group
          </button>
          <button onClick={() => setShowNewCompModal(true)} className="btn btn-primary">
            <Plus size={16} />
            Add Component
          </button>
        </div>
      )}
    </div>
  );
};
