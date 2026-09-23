import { buildApp } from "../apps/api/src/app.js";

async function run() {
  console.log("Starting Auth Flow & Login Verification...");
  const app = await buildApp();

  const ts = Date.now();
  const testEmail = `operator-${ts}@test.org`;
  const testOrgName = `Test Enterprise ${ts}`;
  const testOrgSlug = `test-ent-${ts}`;
  const password = "securePassword123";

  // 1. Register User & Org
  console.log("1. Registering new organization and admin...");
  const regRes = await app.inject({
    method: "POST",
    url: "/api/v1/auth/register",
    payload: {
      name: "Alex Rivera",
      email: testEmail,
      password,
      organizationName: testOrgName,
      organizationSlug: testOrgSlug,
    },
  });

  if (regRes.statusCode !== 201) {
    throw new Error(`Register failed with status ${regRes.statusCode}: ${regRes.body}`);
  }
  const regData = JSON.parse(regRes.body);
  console.log(`   User registered: ${regData.user.id}, Org: ${regData.org.id} (${regData.org.name})`);

  // 2. Login with valid credentials
  console.log("2. Testing valid login (/api/v1/auth/login)...");
  const loginRes = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: {
      email: testEmail,
      password,
    },
  });

  if (loginRes.statusCode !== 200) {
    throw new Error(`Login failed with status ${loginRes.statusCode}: ${loginRes.body}`);
  }
  const loginData = JSON.parse(loginRes.body);
  console.log(`   Login succeeded for user: ${loginData.user.email}`);
  console.log(`   Returned organizations: ${loginData.organizations.length}`);

  if (loginData.organizations.length === 0 || loginData.organizations[0].slug !== testOrgSlug) {
    throw new Error(`Expected organization ${testOrgSlug} not found in user's organizations!`);
  }

  // 3. Login with invalid password
  console.log("3. Testing invalid credentials...");
  const badLoginRes = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: {
      email: testEmail,
      password: "wrongPassword",
    },
  });

  if (badLoginRes.statusCode !== 401) {
    throw new Error(`Expected 401 for bad password, received: ${badLoginRes.statusCode}`);
  }
  console.log("   Invalid credentials rejected with 401 correctly.");

  // 4. Create page using logged-in user context
  console.log("4. Creating status page under authenticated organization...");
  const pageRes = await app.inject({
    method: "POST",
    url: `/api/v1/orgs/${loginData.organizations[0].id}/pages`,
    headers: { "x-user-id": loginData.user.id },
    payload: {
      name: "Global Edge Status",
      slug: `edge-${ts}`,
      description: "Edge networks and latency monitors",
      visibility: "public",
    },
  });

  if (pageRes.statusCode !== 201) {
    throw new Error(`Page creation failed with ${pageRes.statusCode}: ${pageRes.body}`);
  }
  const pageData = JSON.parse(pageRes.body);
  console.log(`   Created Page: ${pageData.name} (${pageData.slug})`);

  console.log("\n🎉 ALL AUTH & LOGIN FLOW VERIFICATIONS PASSED SUCCESSFULLY!");
  await app.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Auth flow verification failed:", err);
  process.exit(1);
});
