import "dotenv/config";

const BASE_URL = "http://localhost:3000";

async function testAuthFlow() {
  console.log("\n🧪 Running E2E Auth Flow Test...\n");

  try {
    // Step 1: Sign up user
    console.log("📝 Signing up...");
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "Test123!@#";

    const signupRes = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test User",
      }),
    });

    if (signupRes.status !== 201 && signupRes.status !== 200) {
      console.log(`❌ Signup failed: ${signupRes.status}`);
      const text = await signupRes.text();
      console.log(text.substring(0, 200));
      return false;
    }

    console.log(`✓ User created: ${testEmail}`);

    // Step 2: Get CSRF token
    console.log("🔐 Getting CSRF token...");
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const { csrfToken } = await csrfRes.json();
    console.log(`✓ CSRF token obtained`);

    // Step 3: Get login page to extract initial cookies
    console.log("📄 Loading login page...");
    const loginPageRes = await fetch(`${BASE_URL}/auth/login`);
    const setCookieHeaders = loginPageRes.headers.getSetCookie?.() || [];
    const initialCookies = setCookieHeaders.join("; ");
    console.log(`✓ Login page loaded, cookies: ${initialCookies ? "yes" : "none"}`);

    // Step 4: Login via credentials provider
    console.log("🔑 Attempting login...");
    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(initialCookies && { "Cookie": initialCookies }),
      },
      body: new URLSearchParams({
        email: testEmail,
        password: testPassword,
        csrfToken,
        redirect: "false",
      }).toString(),
      redirect: "manual",
    });

    console.log(`📤 Login response: ${loginRes.status} ${loginRes.statusText}`);
    const sessionCookies = loginRes.headers.getSetCookie?.() || [];
    console.log(`✓ Login completed, session cookies: ${sessionCookies.length} set`);

    // Combine all cookies
    const allCookies = [...setCookieHeaders, ...sessionCookies].join("; ");

    // Step 5: Check session
    console.log("🔍 Checking session...");
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: { "Cookie": allCookies },
    });

    const sessionData = await sessionRes.json();
    console.log(`✓ Session check: ${sessionRes.status}`);
    console.log(`  User email: ${sessionData.user?.email || "none"}`);

    // Step 6: Access protected dashboard
    console.log("🏠 Accessing dashboard...");
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { "Cookie": allCookies },
      redirect: "manual",
    });

    console.log(`✓ Dashboard response: ${dashRes.status}`);

    if (dashRes.status === 200) {
      console.log("✅ Dashboard accessible - NO REDIRECT LOOP!");
      return true;
    } else if (dashRes.status === 307 || dashRes.status === 302) {
      const location = dashRes.headers.get("location");
      console.log(`⚠️  Dashboard redirected to: ${location}`);
      // Only fail if redirect is back to login
      if (location?.includes("/auth/login")) {
        console.log("❌ REDIRECT LOOP DETECTED!");
        return false;
      }
    }

    console.log("\n✅ E2E TEST PASSED - Login works without redirect loops!\n");
    return true;
  } catch (error) {
    console.error(`\n❌ Test failed:`, error);
    return false;
  }
}

testAuthFlow().then((success) => process.exit(success ? 0 : 1));
