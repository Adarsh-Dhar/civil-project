import "dotenv/config";

const BASE_URL = "http://localhost:3000";

async function debugAuthFlow() {
  console.log("\n🔍 Debugging auth flow...\n");

  let cookies = "";
  const testEmail = `debug-${Date.now()}@example.com`;
  const testPassword = "Test123!@#";

  // Step 1: Signup
  console.log("1️⃣ Signing up user...");
  const signupRes = await fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: "Debug User",
    }),
  });
  console.log(`   Status: ${signupRes.status}`);
  console.log(`   Headers: ${JSON.stringify(Object.fromEntries(signupRes.headers))}`);

  // Step 2: Get CSRF
  console.log("\n2️⃣ Getting CSRF token...");
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrf = csrfData.csrfToken;
  console.log(`   CSRF Token: ${csrf?.substring(0, 20)}...`);

  // Step 3: Login
  console.log("\n3️⃣ Logging in with credentials...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      email: testEmail,
      password: testPassword,
      csrfToken: csrf,
      redirect: "false",
    }).toString(),
    redirect: "manual", // Don't follow redirects
  });

  console.log(`   Status: ${loginRes.status}`);
  console.log(`   Response URL: ${loginRes.url}`);

  // Log all response headers
  console.log(`   Response Headers:`);
  loginRes.headers.forEach((value, key) => {
    if (key.toLowerCase().includes("cookie") || key.toLowerCase().includes("set-cookie")) {
      console.log(`     ${key}: ${value}`);
    }
  });

  // Extract cookies from all Set-Cookie headers
  const allSetCookies: string[] = [];
  loginRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      allSetCookies.push(value);
    }
  });
  console.log(`   Total Set-Cookie headers: ${allSetCookies.length}`);

  // Combine all cookies for next requests
  cookies = allSetCookies.map(c => c.split(";")[0]).join("; ");
  console.log(`   Combined cookies: ${cookies?.substring(0, 50)}...`);

  // Step 4: Check session
  console.log("\n4️⃣ Checking session with cookies...");
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: {
      Cookie: cookies,
    },
  });

  console.log(`   Status: ${sessionRes.status}`);
  const sessionData = await sessionRes.json();
  console.log(`   Session data:`, sessionData);
  console.log(`   Has user: ${!!sessionData?.user}`);

  if (sessionData?.user) {
    console.log(`   User email: ${sessionData.user.email}`);
  } else {
    console.log("   ⚠️ No user in session! Cookies might not be working.");
  }

  // Step 5: Try to access protected route
  console.log("\n5️⃣ Accessing protected /dashboard...");
  const dashRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: {
      Cookie: cookies,
    },
    redirect: "manual",
  });

  console.log(`   Status: ${dashRes.status}`);
  console.log(`   Response length: ${(await dashRes.text()).length} bytes`);

  // Step 6: Check cookies directly in browser simulation
  console.log("\n6️⃣ Testing session retrieval without cookies...");
  const noCookieSessionRes = await fetch(`${BASE_URL}/api/auth/session`);
  const noCookieData = await noCookieSessionRes.json();
  console.log(`   Session without cookies:`, noCookieData);
}

debugAuthFlow().catch(console.error);
