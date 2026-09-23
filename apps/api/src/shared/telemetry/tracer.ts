import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { trace, context } from "@opentelemetry/api";

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces";

export const traceExporter = new OTLPTraceExporter({
  url: otlpEndpoint,
});

export const otelSdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "noroshi-api",
    [ATTR_SERVICE_VERSION]: "1.0.0",
    "deployment.environment": process.env.NODE_ENV || "development",
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
    }),
  ],
});

export function startTelemetry() {
  try {
    otelSdk.start();
    console.log(`[Telemetry] OpenTelemetry SDK initialized, exporting traces to ${otlpEndpoint}`);
  } catch (err) {
    console.warn("[Telemetry] Failed to initialize OpenTelemetry SDK:", err);
  }
}

export function getActiveTraceContext(): { trace_id?: string; span_id?: string } {
  const activeSpan = trace.getSpan(context.active());
  if (!activeSpan) return {};
  const spanContext = activeSpan.spanContext();
  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
  };
}
