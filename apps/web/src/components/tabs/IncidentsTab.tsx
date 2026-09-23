import { CheckCircle, Activity, Plus } from "lucide-react";
import { useApp } from "../../context/AppContext.js";
import type { IncidentFilter } from "../../types/index.js";

export const IncidentsTab: React.FC = () => {
  const {
    incidents,
    components,
    incidentFilter,
    setIncidentFilter,
    transitionIncidentStatus,
    setShowAddUpdateModal,
  } = useApp();

  const activeIncidentsCount = incidents.filter((i) => i.status !== "resolved").length;
  const sev1Count = incidents.filter((i) => i.status !== "resolved" && i.severity === "sev1").length;

  const filteredIncidents = incidents.filter((inc) => {
    if (incidentFilter === "all") return true;
    return inc.status === incidentFilter;
  });

  return (
    <div>
      {/* Metric KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Active Incidents</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: 4, color: activeIncidentsCount > 0 ? "#EF4444" : "#10B981" }}>
            {activeIncidentsCount}
          </div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Sev-1 Outages</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: 4, color: sev1Count > 0 ? "#EF4444" : "var(--text-primary)" }}>
            {sev1Count}
          </div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Monitored Components</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: 4 }}>
            {components.length}
          </div>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>Total Handled</span>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: 4 }}>
            {incidents.length}
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {(["all", "triggered", "investigating", "resolved"] as IncidentFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setIncidentFilter(filter)}
            className={`btn btn-sm ${incidentFilter === filter ? "btn-secondary" : "btn-ghost"}`}
            style={{ textTransform: "capitalize", borderRadius: 999 }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
          <CheckCircle size={36} color="#10B981" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 4 }}>No incidents found</h3>
          <p style={{ fontSize: "0.9rem" }}>No incidents matching the '{incidentFilter}' criteria.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  inc.status === "resolved"
                    ? "#10B981"
                    : inc.severity === "sev1"
                    ? "#EF4444"
                    : "#F97316"
                }`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{inc.title}</h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: inc.severity === "sev1" ? "rgba(239, 68, 68, 0.2)" : "rgba(249, 115, 22, 0.2)",
                        color: inc.severity === "sev1" ? "#EF4444" : "#F97316",
                      }}
                    >
                      {inc.severity.toUpperCase()}
                    </span>
                    <span
                      className={`badge ${
                        inc.status === "resolved"
                          ? "badge-operational"
                          : inc.status === "investigating"
                          ? "badge-degraded"
                          : "badge-major"
                      }`}
                    >
                      <span className="badge-dot" />
                      {inc.status}
                    </span>
                  </div>
                  {inc.description && (
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{inc.description}</p>
                  )}
                </div>

                {/* State Machine Transition Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  {inc.status === "triggered" && (
                    <button
                      onClick={() => transitionIncidentStatus(inc.id, "investigating")}
                      className="btn btn-secondary btn-sm"
                    >
                      <Activity size={14} />
                      Investigate
                    </button>
                  )}

                  {inc.status !== "resolved" && (
                    <button
                      onClick={() => transitionIncidentStatus(inc.id, "resolved")}
                      className="btn btn-sm btn-success"
                    >
                      <CheckCircle size={14} />
                      Resolve
                    </button>
                  )}

                  <button
                    onClick={() => setShowAddUpdateModal(inc)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} />
                    Add Update
                  </button>
                </div>
              </div>

              {/* Timeline Updates */}
              {inc.updates && inc.updates.length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {inc.updates.map((u) => (
                    <div key={u.id} style={{ display: "flex", gap: 12, fontSize: "0.825rem" }}>
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.75rem",
                          minWidth: 100,
                        }}
                      >
                        {new Date(u.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        <strong style={{ color: "var(--text-primary)" }}>[{u.status}]</strong> {u.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
