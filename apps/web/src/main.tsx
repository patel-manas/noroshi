import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";
import { initSentry } from "./telemetry/sentry.js";

// Initialize Sentry and browser tracing
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <div style={{ padding: 40, color: "#EF4444", background: "#090A0C", minHeight: "100vh" }}>
          <h2>Application Error</h2>
          <pre>{String(error)}</pre>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
