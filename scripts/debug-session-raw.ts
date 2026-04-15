import "dotenv/config";

const BASE_URL = "http://localhost:3000";

async function debug() {
  const email = `test-${Date.now()}@example.com`;
  const password = "Test123!@#";

  // Signup
  console.log("📝 Signing up...");
  const signupRes = await fetch(`${BASE_URL}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: "Test" }),
  });
  console.log(`Signup: ${signupRes.status}`);

  // Get CSRF
  console.log("🔐 Getting CSRF...");
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();

  // Get login cookies
  const loginPageRes = await fetch(`${BASE_URL}/auth/login`);
  const cookies1 = loginPageRes.headers.getSetCookie?.() || [];
  console.log(`Login page cookies: ${cookies1.length}`);

  // Login
  console.log("🔑 Logging in...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookies1.join("; "),
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken,
      redirect: "false",
    }).toString(),
    redirect: "manual",
  });

  const cookies2 = loginRes.headers.getSetCookie?.() || [];
  const allCookies = [...cookies1, ...cookies2].join("; ");
  console.log(`Login response: ${loginRes.status}, session cookies: ${cookies2.length}`);

  // Get raw session
  console.log("\n📊 Checking raw session JSON...");
  const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
    headers: { "Cookie": allCookies },
  });

  const sessionJSON = await sessionRes.text();
  console.log(`Session response status: ${sessionRes.status}`);
  console.log(`Session response body (first 500 chars):`);
  console.log(sessionJSON.substring(0, 500));

  try {
    const sessionData = JSON.parse(sessionJSON);
    console.log(`\nParsed session:`, JSON.stringify(sessionData, null, 2));
  } catch (e) {
    console.log(`Failed to parse as JSON`);
  }
}

debug().catch(console.error);
