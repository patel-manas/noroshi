import client from "prom-client";

// Create custom Prometheus Registry
export const metricsRegistry = new client.Registry();

// Collect Node.js process and runtime default metrics
client.collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "noroshi_",
});

// Custom HTTP Metrics
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: "noroshi_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [metricsRegistry],
});

// Domain Metric: Incidents Created
export const incidentsTotal = new client.Counter({
  name: "noroshi_incidents_total",
  help: "Total number of incidents created",
  labelNames: ["severity", "status"],
  registers: [metricsRegistry],
});

// Domain Metric: Incident State Transitions
export const incidentTransitionsTotal = new client.Counter({
  name: "noroshi_incident_transitions_total",
  help: "Total number of incident state machine transitions",
  labelNames: ["from_status", "to_status"],
  registers: [metricsRegistry],
});

// Domain Metric: Active Incidents
export const activeIncidentsGauge = new client.Gauge({
  name: "noroshi_active_incidents",
  help: "Current number of non-resolved incidents",
  registers: [metricsRegistry],
});

// Domain Metric: Alerts Received & Deduplicated
export const alertsReceivedTotal = new client.Counter({
  name: "noroshi_alerts_received_total",
  help: "Total number of monitoring alerts received",
  labelNames: ["source", "deduplicated"],
  registers: [metricsRegistry],
});
