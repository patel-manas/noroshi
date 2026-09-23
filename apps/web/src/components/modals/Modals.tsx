import React, { useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../../context/AppContext.js";
import type { IncidentSeverity } from "../../types/index.js";

export const Modals: React.FC = () => {
  const {
    components,
    groups,
    showNewIncidentModal,
    setShowNewIncidentModal,
    showNewPageModal,
    setShowNewPageModal,
    showNewGroupModal,
    setShowNewGroupModal,
    showNewCompModal,
    setShowNewCompModal,
    showAddUpdateModal,
    setShowAddUpdateModal,
    createIncident,
    createPage,
    createGroup,
    createComponent,
    addIncidentUpdate,
  } = useApp();

  // Create Incident Form State
  const [incTitle, setIncTitle] = useState("");
  const [incDesc, setIncDesc] = useState("");
  const [incSev, setIncSev] = useState<IncidentSeverity>("sev2");
  const [incCompId, setIncCompId] = useState("");
  const [incImpactStatus, setIncImpactStatus] = useState("major_outage");

  // Create Page Form State
  const [pageName, setPageName] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [pageDesc, setPageDesc] = useState("");
  const [pageVisibility, setPageVisibility] = useState<"public" | "private">("public");

  // Create Group Form State
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");

  // Create Component Form State
  const [compName, setCompName] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compGroupId, setCompGroupId] = useState("");

  // Add Update Form State
  const [updateMsg, setUpdateMsg] = useState("");
  const [updateStatus, setUpdateStatus] = useState("investigating");

  async function handleCreateIncidentSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createIncident({
        title: incTitle,
        description: incDesc,
        severity: incSev,
        affectedComponentId: incCompId || undefined,
        impactStatus: incImpactStatus,
      });
      setIncTitle("");
      setIncDesc("");
      setIncCompId("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleCreatePageSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const derivedSlug =
        pageSlug.trim() ||
        pageName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      await createPage({
        name: pageName,
        slug: derivedSlug,
        description: pageDesc,
        visibility: pageVisibility,
      });
      setPageName("");
      setPageSlug("");
      setPageDesc("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleCreateGroupSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createGroup(groupName, groupDesc);
      setGroupName("");
      setGroupDesc("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleCreateComponentSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createComponent(compName, compDesc, compGroupId);
      setCompName("");
      setCompDesc("");
      setCompGroupId("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAddUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!showAddUpdateModal) return;
    try {
      await addIncidentUpdate(showAddUpdateModal.id, updateMsg, updateStatus);
      setUpdateMsg("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <>
      {/* MODAL: DECLARE INCIDENT */}
      {showNewIncidentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Declare New Incident</h3>
              <button onClick={() => setShowNewIncidentModal(false)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateIncidentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Incident Title</label>
                  <input
                    type="text"
                    value={incTitle}
                    onChange={(e) => setIncTitle(e.target.value)}
                    placeholder="e.g. Elevate 5xx errors on checkout API"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select
                    value={incSev}
                    onChange={(e) => setIncSev(e.target.value as IncidentSeverity)}
                    className="form-select"
                  >
                    <option value="sev1">SEV-1 (Critical Outage)</option>
                    <option value="sev2">SEV-2 (Major Disruption)</option>
                    <option value="sev3">SEV-3 (Minor Degraded)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Initial Findings</label>
                  <textarea
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    placeholder="Provide context on impact and ongoing checks..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link Affected Component (Optional)</label>
                  <select
                    value={incCompId}
                    onChange={(e) => setIncCompId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- None --</option>
                    {components.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {incCompId && (
                  <div className="form-group">
                    <label className="form-label">Component Impact Status</label>
                    <select
                      value={incImpactStatus}
                      onChange={(e) => setIncImpactStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="major_outage">Major Outage</option>
                      <option value="partial_outage">Partial Outage</option>
                      <option value="degraded_performance">Degraded Performance</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewIncidentModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Declare Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE STATUS PAGE */}
      {showNewPageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Create New Status Page</h3>
              <button onClick={() => setShowNewPageModal(false)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePageSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Page Name</label>
                  <input
                    type="text"
                    value={pageName}
                    onChange={(e) => {
                      setPageName(e.target.value);
                      if (!pageSlug) {
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }
                    }}
                    placeholder="e.g. Developer Platform Status, Customer Portal"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Page Slug (URL Identifier)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>
                      /status/
                    </span>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="e.g. developer-status"
                      className="form-input"
                      style={{ flex: 1 }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    value={pageDesc}
                    onChange={(e) => setPageDesc(e.target.value)}
                    placeholder="Real-time uptime and incident history for developers..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <select
                    value={pageVisibility}
                    onChange={(e) => setPageVisibility(e.target.value as "public" | "private")}
                    className="form-select"
                  >
                    <option value="public">Public (Visible to everyone)</option>
                    <option value="private">Private (Restricted access)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewPageModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COMPONENT GROUP */}
      {showNewGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Create Component Group</h3>
              <button onClick={() => setShowNewGroupModal(false)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateGroupSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Core Infrastructure, Third Party APIs"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text"
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    placeholder="e.g. Databases and primary ingress endpoints"
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewGroupModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COMPONENT */}
      {showNewCompModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Add Component</h3>
              <button onClick={() => setShowNewCompModal(false)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateComponentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Component Name</label>
                  <input
                    type="text"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    placeholder="e.g. Authentication Service, Webhook Worker"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <input
                    type="text"
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    placeholder="e.g. Issues JWTs and validates session tokens"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign to Group (Optional)</label>
                  <select
                    value={compGroupId}
                    onChange={(e) => setCompGroupId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- No Group (Ungrouped) --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewCompModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TIMELINE UPDATE */}
      {showAddUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                Post Update for: {showAddUpdateModal.title}
              </h3>
              <button onClick={() => setShowAddUpdateModal(null)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddUpdateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Timeline Message</label>
                  <textarea
                    value={updateMsg}
                    onChange={(e) => setUpdateMsg(e.target.value)}
                    placeholder="e.g. Traffic re-routed to backup region. Latency recovering."
                    className="form-textarea"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddUpdateModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
