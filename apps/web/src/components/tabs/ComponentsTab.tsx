import { Layers } from "lucide-react";
import { useApp } from "../../context/AppContext.js";
import type { ComponentStatus } from "../../types/index.js";

export const ComponentsTab: React.FC = () => {
  const { groups, components, updateComponentStatus } = useApp();

  if (groups.length === 0 && components.length === 0) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
        <Layers size={36} color="#3D87FF" style={{ margin: "0 auto 12px" }} />
        <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: 4 }}>No components created</h3>
        <p style={{ fontSize: "0.9rem" }}>Add component groups and services to monitor them on the status page.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {groups.map((group) => {
        const groupComps = components.filter((c) => c.groupId === group.id);
        return (
          <div key={group.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                background: "var(--bg-surface-subtle)",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{group.name}</h3>
                {group.description && (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{group.description}</p>
                )}
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {groupComps.length} component{groupComps.length === 1 ? "" : "s"}
              </span>
            </div>

            {groupComps.length === 0 ? (
              <div style={{ padding: 20, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                No components in this group.
              </div>
            ) : (
              <div>
                {groupComps.map((comp) => (
                  <div
                    key={comp.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "0.925rem", fontWeight: 500 }}>{comp.name}</h4>
                      {comp.description && (
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{comp.description}</p>
                      )}
                    </div>

                    {/* Interactive Live Status Switcher */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <select
                        value={comp.status}
                        onChange={(e) => updateComponentStatus(comp.id, e.target.value as ComponentStatus)}
                        className="form-select"
                        style={{ padding: "4px 8px", fontSize: "0.8rem", borderRadius: 6 }}
                      >
                        <option value="operational">Operational</option>
                        <option value="degraded_performance">Degraded Performance</option>
                        <option value="partial_outage">Partial Outage</option>
                        <option value="major_outage">Major Outage</option>
                        <option value="under_maintenance">Under Maintenance</option>
                      </select>

                      <span
                        className={`badge ${
                          comp.status === "operational"
                            ? "badge-operational"
                            : comp.status === "major_outage"
                            ? "badge-major"
                            : "badge-degraded"
                        }`}
                      >
                        <span className="badge-dot" />
                        {comp.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
