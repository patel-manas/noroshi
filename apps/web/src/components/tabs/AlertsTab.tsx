import React, { useState } from "react";
import { Send, RefreshCw } from "lucide-react";
import { useApp } from "../../context/AppContext.js";

export const AlertsTab: React.FC = () => {
  const { alerts, sendWebhookAlert, refreshAlerts } = useApp();

  const [testAlertSource, setTestAlertSource] = useState("datadog");
  const [testAlertKey, setTestAlertKey] = useState("checkout-api-500");
  const [testAlertMsg, setTestAlertMsg] = useState("Checkout latency exceeded 1500ms");
  const [webhookResult, setWebhookResult] = useState<any>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await sendWebhookAlert(testAlertSource, testAlertKey, testAlertMsg);
      setWebhookResult(result);
    } catch (err: any) {
      setWebhookResult({ error: err.message });
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Left: Webhook simulator */}
      <div className="card">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 6 }}>Simulate Alert Webhook</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
          Test the deduplication and rate limiting engine. Sending the same Dedupe Key returns an idempotent 200 without creating duplicates.
        </p>

        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">Source System</label>
            <select
              value={testAlertSource}
              onChange={(e) => setTestAlertSource(e.target.value)}
              className="form-select"
            >
              <option value="datadog">Datadog</option>
              <option value="prometheus">Prometheus / Alertmanager</option>
              <option value="aws_cloudwatch">AWS CloudWatch</option>
              <option value="pagerduty">PagerDuty</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dedupe Key (Idempotency Key)</label>
            <input
              type="text"
              value={testAlertKey}
              onChange={(e) => setTestAlertKey(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alert Message</label>
            <input
              type="text"
              value={testAlertMsg}
              onChange={(e) => setTestAlertMsg(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 8 }}>
            <Send size={15} />
            POST /webhooks/alerts
          </button>
        </form>

        {webhookResult && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 8,
              background: webhookResult.data?.deduplicated
                ? "rgba(245, 158, 11, 0.1)"
                : "rgba(16, 185, 129, 0.1)",
              border: `1px solid ${
                webhookResult.data?.deduplicated
                  ? "rgba(245, 158, 11, 0.3)"
                  : "rgba(16, 185, 129, 0.3)"
              }`,
              fontSize: "0.85rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, marginBottom: 4 }}>
              <span>HTTP {webhookResult.status}</span>
              <span>{webhookResult.timestamp}</span>
            </div>
            <pre style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", overflowX: "auto" }}>
              {JSON.stringify(webhookResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Right: Live Alerts Stream */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Recent Ingested Alerts</h3>
          <button onClick={() => refreshAlerts()} className="btn btn-ghost btn-sm">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {alerts.length === 0 ? (
          <div style={{ padding: 36, textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            No alerts ingested yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto" }}>
            {alerts.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--bg-surface-subtle)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#3D87FF" }}>
                    [{a.source.toUpperCase()}]
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "JetBrains Mono" }}>
                    {new Date(a.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", marginBottom: 4 }}>{a.message}</p>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  key: {a.dedupeKey}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
