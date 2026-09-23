import { buildApp } from "../apps/api/src/app.js";
import { queryClient } from "../apps/api/src/shared/db/client.js";
import { redis } from "../apps/api/src/shared/redis/client.js";

async function runVerification() {
  console.log("🚀 Starting Phase 1 Modular Monolith Automated Verification...\n");

  const app = await buildApp();
  await app.ready();

  try {
    // 1. Health check
    console.log("1. Verifying /health endpoint...");
    const healthRes = await app.inject({
      method: "GET",
      url: "/health",
    });
    console.log(`   Status: ${healthRes.statusCode}, Body: ${healthRes.body}`);
    if (healthRes.statusCode !== 200) throw new Error("Health check failed");

    // 2. Register Admin User & Organization
    console.log("\n2. Testing User & Organization Registration...");
    const regRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: `admin-${Date.now()}@example.com`,
        name: "Admin User",
        organizationName: "Acme Corp",
        organizationSlug: `acme-${Date.now()}`,
      },
    });
    console.log(`   Register response status: ${regRes.statusCode}`);
    const { user, org } = JSON.parse(regRes.body);
    console.log(`   Created User ID: ${user.id}, Org ID: ${org.id}`);

    // 3. Create Status Page
    console.log("\n3. Testing Page Creation...");
    const pageRes = await app.inject({
      method: "POST",
      url: `/api/v1/orgs/${org.id}/pages`,
      headers: { "x-user-id": user.id },
      payload: {
        name: "Acme Status",
        slug: "acme-status",
        description: "Official Acme status page",
        visibility: "public",
      },
    });
    console.log(`   Page response status: ${pageRes.statusCode}`);
    const page = JSON.parse(pageRes.body);
    console.log(`   Created Page ID: ${page.id}, Name: ${page.name}`);

    // 4. Create Component Group & Component
    console.log("\n4. Testing Component Group & Component Creation...");
    const groupRes = await app.inject({
      method: "POST",
      url: `/api/v1/orgs/${org.id}/pages/${page.id}/groups`,
      headers: { "x-user-id": user.id },
      payload: {
        name: "Core Services",
        description: "Critical backends",
        orderIndex: 1,
      },
    });
    const group = JSON.parse(groupRes.body);
    console.log(`   Created Component Group: '${group.name}' (${group.id})`);

    const compRes = await app.inject({
      method: "POST",
      url: `/api/v1/orgs/${org.id}/pages/${page.id}/components`,
      headers: { "x-user-id": user.id },
      payload: {
        name: "Payment Processing API",
        groupId: group.id,
        status: "operational",
        orderIndex: 1,
      },
    });
    const comp = JSON.parse(compRes.body);
    console.log(`   Created Component: '${comp.name}' with initial status: ${comp.status}`);

    // 5. Create Incident linked to page and component
    console.log("\n5. Testing Incident Creation with Component Linkage...");
    const incRes = await app.inject({
      method: "POST",
      url: `/api/v1/orgs/${org.id}/incidents`,
      headers: { "x-user-id": user.id },
      payload: {
        title: "Checkout Latency Spike",
        description: "Payment Gateway returns elevated latency",
        severity: "sev1",
        status: "triggered",
        pageIds: [page.id],
        affectedComponents: [
          { componentId: comp.id, impactStatus: "major_outage" },
        ],
      },
    });
    const incident = JSON.parse(incRes.body);
    console.log(`   Created Incident: '${incident.title}' (${incident.id}) - Status: ${incident.status}`);

    // Verify component status changed to major_outage
    const compCheck = await app.inject({
      method: "GET",
      url: `/api/v1/orgs/${org.id}/pages/${page.id}/components`,
      headers: { "x-user-id": user.id },
    });
    const updatedComps = JSON.parse(compCheck.body);
    const affected = updatedComps.find((c: any) => c.id === comp.id);
    console.log(`   Verified component status automatically updated to: ${affected.status}`);
    if (affected.status !== "major_outage") throw new Error("Component status was not updated to major_outage");

    // 6. Test State Machine Transition: triggered -> investigating
    console.log("\n6. Testing State Machine Transition: triggered -> investigating...");
    const trans1 = await app.inject({
      method: "PATCH",
      url: `/api/v1/orgs/${org.id}/incidents/${incident.id}/status`,
      headers: { "x-user-id": user.id },
      payload: {
        status: "investigating",
        message: "Engineering has identified bottleneck in database connection pool",
      },
    });
    console.log(`   Transition status: ${trans1.statusCode}`);
    const incInvestigating = JSON.parse(trans1.body);
    console.log(`   Incident new status: ${incInvestigating.status}`);
    if (incInvestigating.status !== "investigating") throw new Error("Expected status to be investigating");

    // 7. Test Invalid Transition: investigating -> triggered (must be rejected)
    console.log("\n7. Testing Invalid Transition: investigating -> triggered (should fail)...");
    const transInvalid = await app.inject({
      method: "PATCH",
      url: `/api/v1/orgs/${org.id}/incidents/${incident.id}/status`,
      headers: { "x-user-id": user.id },
      payload: {
        status: "triggered",
      },
    });
    console.log(`   Invalid transition rejected with status: ${transInvalid.statusCode}`);
    console.log(`   Error message: ${JSON.parse(transInvalid.body).error}`);
    if (transInvalid.statusCode !== 400) throw new Error("Invalid transition was not rejected with 400");

    // 8. Test State Machine Transition: investigating -> resolved
    console.log("\n8. Testing State Machine Transition: investigating -> resolved...");
    const transResolve = await app.inject({
      method: "PATCH",
      url: `/api/v1/orgs/${org.id}/incidents/${incident.id}/status`,
      headers: { "x-user-id": user.id },
      payload: {
        status: "resolved",
        message: "Connection pool resized, latency normal",
      },
    });
    const incResolved = JSON.parse(transResolve.body);
    console.log(`   Incident resolved at: ${incResolved.resolvedAt}`);

    // Verify component restored to operational
    const compCheckAfterResolve = await app.inject({
      method: "GET",
      url: `/api/v1/orgs/${org.id}/pages/${page.id}/components`,
      headers: { "x-user-id": user.id },
    });
    const compsResolved = JSON.parse(compCheckAfterResolve.body);
    const restoredComp = compsResolved.find((c: any) => c.id === comp.id);
    console.log(`   Verified component status restored to: ${restoredComp.status}`);
    if (restoredComp.status !== "operational") throw new Error("Component status was not restored to operational");

    // 9. Test Invalid Transition: resolved -> investigating (terminal state)
    console.log("\n9. Testing Invalid Transition: resolved -> investigating (should fail)...");
    const transInvalidFromResolved = await app.inject({
      method: "PATCH",
      url: `/api/v1/orgs/${org.id}/incidents/${incident.id}/status`,
      headers: { "x-user-id": user.id },
      payload: {
        status: "investigating",
      },
    });
    console.log(`   Terminal transition rejected with status: ${transInvalidFromResolved.statusCode}`);
    if (transInvalidFromResolved.statusCode !== 400) throw new Error("Transition from resolved was not rejected");

    // 10. Test Alert Ingestion & Deduplication
    console.log("\n10. Testing Alert Webhook & Idempotency (Deduplication)...");
    const dedupeKey = `checkout-api-500-${Date.now()}`;
    const alertPayload = {
      source: "datadog",
      dedupeKey,
      message: "Checkout API error rate > 5%",
      payload: { metric: 5.4, host: "prod-worker-1" },
    };

    // First request (new alert)
    const alertRes1 = await app.inject({
      method: "POST",
      url: `/api/v1/orgs/${org.id}/webhooks/alerts`,
      payload: alertPayload,
    });
    console.log(`   First Alert: Status ${alertRes1.statusCode}, Deduplicated: ${JSON.parse(alertRes1.body).deduplicated}`);
    if (alertRes1.statusCode !== 201) throw new Error("First alert ingestion failed");

    // Second request (duplicate alert with identical dedupeKey)
    const alertRes2 = await app.inject({
      method: "POST",
      url: `/api/v1/orgs/${org.id}/webhooks/alerts`,
      payload: alertPayload,
    });
    console.log(`   Duplicate Alert: Status ${alertRes2.statusCode}, Deduplicated: ${JSON.parse(alertRes2.body).deduplicated}`);
    if (alertRes2.statusCode !== 200 || !JSON.parse(alertRes2.body).deduplicated) {
      throw new Error("Idempotency deduplication failed");
    }

    // 12. Test Public Status Page SSR Serving (Step 20)
    console.log("\n12. Testing Public Status Page SSR Rendering (/status/:slug)...");
    const ssrRes = await app.inject({
      method: "GET",
      url: `/status/${page.slug}`,
    });
    console.log(`   SSR Response Status: ${ssrRes.statusCode}`);
    console.log(`   SSR Content Length: ${ssrRes.body.length} bytes`);
    console.log(`   Contains Astryx Theme: ${ssrRes.body.includes('data-astryx-theme="astryx"')}`);
    console.log(`   Contains Page Title: ${ssrRes.body.includes("Acme Status")}`);
    console.log(`   Contains Component Group: ${ssrRes.body.includes("Core Services")}`);
    console.log(`   Contains Payment Processing API: ${ssrRes.body.includes("Payment Processing API")}`);

    if (ssrRes.statusCode !== 200) throw new Error("SSR status page rendering failed");
    if (!ssrRes.body.includes("Acme Status")) throw new Error("SSR missing page title");

    console.log("\n🎉 ALL PHASE 1 MODULAR MONOLITH VERIFICATIONS PASSED SUCCESSFULLY!");
  } finally {
    await app.close();
    await redis.quit();
    await queryClient.end();
  }
}

runVerification().catch((err) => {
  console.error("\n❌ Verification Failed:", err);
  process.exit(1);
});
