import "dotenv/config";

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<boolean>, details: string) {
  try {
    const passed = await fn();
    results.push({ name, passed, details: passed ? "✓ " + details : "✗ " + details });
    console.log(`${passed ? "✓" : "✗"} ${name}`);
  } catch (error) {
    results.push({ name, passed: false, details: `✗ ${details} - ${error}` });
    console.log(`✗ ${name} - Error: ${error}`);
  }
}

async function fetchWithCookies(
  url: string,
  options: RequestInit & { cookies?: string } = {}
) {
  const { cookies, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  if (cookies) {
    headers.set("Cookie", cookies);
  }
  const response = await fetch(url, { ...fetchOptions, headers });
  return response;
}

async function runTests() {
  console.log("\n🧪 Running comprehensive auth flow tests...\n");

  let sessionCookies = "";
  let csrfToken = "";
  let testUserEmail = `test-${Date.now()}@example.com`;
  const testPassword = "Test123!@#";

  // Test 1: Login page loads
  await test(
    "Login page loads",
    async () => {
      const res = await fetch(`${BASE_URL}/auth/login`);
      return res.status === 200;
    },
    "Accessed /auth/login"
  );

  // Test 2: Get CSRF token
  await test(
    "CSRF token available",
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/csrf`);
      const data = await res.json();
      if (data.csrfToken) {
        csrfToken = data.csrfToken;
        return true;
      }
      return false;
    },
    "Retrieved CSRF token from /api/auth/csrf"
  );

  // Test 3: Signup new user
  await test(
    "User signup succeeds",
    async () => {
      const res = await fetch(`${BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUserEmail,
          password: testPassword,
          name: "Test User",
        }),
      });
      return res.status === 201 || res.status === 200;
    },
    `Signed up user ${testUserEmail}`
  );

  // Test 4: Login attempt with wrong password fails
  await test(
    "Login with wrong password fails",
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: testUserEmail,
          password: "WrongPassword123",
          csrfToken,
          redirect: "false",
        }).toString(),
      });
      return res.status >= 400;
    },
    "Rejected invalid credentials"
  );

  // Test 5: Login with correct credentials succeeds
  await test(
    "Login with correct credentials succeeds",
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: testUserEmail,
          password: testPassword,
          csrfToken,
          redirect: "false",
        }).toString(),
      });

      // Capture session cookies
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        sessionCookies = setCookie.split(",")[0].split(";")[0];
      }

      return res.status === 200 || res.status === 302;
    },
    `Authenticated ${testUserEmail}`
  );

  // Test 6: Session persists after login
  await test(
    "Session retrieval succeeds",
    async () => {
      const res = await fetch(`${BASE_URL}/api/auth/session`, {
        headers: sessionCookies ? { Cookie: sessionCookies } : {},
      });
      const data = await res.json();
      return data?.user?.email === testUserEmail;
    },
    "Session valid with authenticated user"
  );

  // Test 7: Unauthenticated user cannot access dashboard
  await test(
    "Unauthenticated access to /dashboard redirects",
    async () => {
      const res = await fetch(`${BASE_URL}/dashboard`, {
        redirect: "manual",
      });
      // Server-side redirect should happen, response should be 307 or page should indicate auth needed
      return res.status !== 200 || !res.ok;
    },
    "Unauthenticated request rejected"
  );

  // Test 8: Authenticated access to dashboard succeeds
  await test(
    "Authenticated access to /dashboard succeeds",
    async () => {
      const res = await fetch(`${BASE_URL}/dashboard`, {
        headers: sessionCookies ? { Cookie: sessionCookies } : {},
      });
      return res.status === 200;
    },
    "Dashboard accessible with valid session"
  );

  // Test 9: Protected pages block unauthorized access
  await test(
    "Protected page /projects blocks unauthorized access",
    async () => {
      const res = await fetch(`${BASE_URL}/projects`, {
        redirect: "manual",
      });
      return res.status !== 200;
    },
    "Unauthenticated /projects rejected"
  );

  // Test 10: Protected pages allow authorized access
  await test(
    "Protected page /projects allows authorized access",
    async () => {
      const res = await fetch(`${BASE_URL}/projects`, {
        headers: sessionCookies ? { Cookie: sessionCookies } : {},
      });
      return res.status === 200;
    },
    "Authenticated /projects accessible"
  );

  // Test 11: Logout clears session
  await test(
    "Logout clears session",
    async () => {
      // Trigger logout
      await fetch(`${BASE_URL}/api/auth/signout`, {
        method: "POST",
        headers: sessionCookies ? { Cookie: sessionCookies } : {},
      });

      // Verify session is cleared
      const res = await fetch(`${BASE_URL}/api/auth/session`, {
        headers: sessionCookies ? { Cookie: sessionCookies } : {},
      });
      const data = await res.json();
      return !data?.user;
    },
    "Session invalidated after logout"
  );

  // Test 12: No redirect loops on login
  await test(
    "No redirect loops detected",
    async () => {
      // Re-login
      const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: testUserEmail,
          password: testPassword,
          csrfToken,
          redirect: "false",
        }).toString(),
      });

      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        sessionCookies = setCookie.split(",")[0].split(";")[0];
      }

      // Access dashboard and check it loads without redirect loop
      const dashRes = await fetch(`${BASE_URL}/dashboard`, {
        headers: sessionCookies ? { Cookie: sessionCookies } : {},
        redirect: "manual",
      });

      // Should load without multiple redirects
      return dashRes.status === 200;
    },
    "Dashboard loads cleanly after login without loops"
  );

  // Summary
  console.log("\n📊 Test Summary:");
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${results.filter((r) => r.passed).length}`);
  console.log(`Failed: ${results.filter((r) => !r.passed).length}`);

  const allPassed = results.every((r) => r.passed);
  console.log(
    `\n${allPassed ? "✅ All tests passed!" : "❌ Some tests failed."}`
  );

  if (!allPassed) {
    console.log("\nFailed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  - ${r.name}: ${r.details}`));
  }

  process.exit(allPassed ? 0 : 1);
}

runTests().catch((error) => {
  console.error("Test runner error:", error);
  process.exit(1);
});
