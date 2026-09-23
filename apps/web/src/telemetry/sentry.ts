import * as Sentry from "@sentry/react";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      tracesSampleRate: 1.0,
      tracePropagationTargets: [
        "localhost",
        /^http:\/\/localhost:3000/,
        /^\/api\/v1/,
      ],
      environment: import.meta.env.MODE || "development",
    });
    console.log("[Telemetry] Sentry initialized with DSN:", sentryDsn);
  } else {
    console.log("[Telemetry] Sentry initialized in local mode (W3C traceparent propagation active).");
  }
}

/**
 * Generates or retrieves a standard W3C traceparent header:
 * Format: 00-{traceId:32hex}-{spanId:16hex}-{flags:02hex}
 * This ensures frontend requests carry distributed trace context to Fastify & Tempo.
 */
export function generateTraceparent(): string {
  const hex = (len: number) => {
    let result = "";
    for (let i = 0; i < len; i++) {
      result += Math.floor(Math.random() * 16).toString(16);
    }
    return result;
  };

  const traceId = hex(32);
  const spanId = hex(16);
  return `00-${traceId}-${spanId}-01`;
}
