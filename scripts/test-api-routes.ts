import "dotenv/config";

type RouteTest = {
  name: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  expectedStatuses: number[];
  body?: unknown;
};

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";

const tests: RouteTest[] = [
  {
    name: "Auth session GET",
    method: "GET",
    path: "/api/auth/session",
    expectedStatuses: [200],
  },
  {
    name: "Auth signout POST",
    method: "POST",
    path: "/api/auth/signout",
    expectedStatuses: [200, 302, 400],
    body: {},
  },
  {
    name: "Signup POST (new user)",
    method: "POST",
    path: "/api/signup",
    expectedStatuses: [201],
    body: {
      name: "API Smoke User",
      email: `api.smoke.${Date.now()}@civil.local`,
      password: "Password123!",
    },
  },
  {
    name: "Onboarding POST (unauthorized)",
    method: "POST",
    path: "/api/onboarding",
    expectedStatuses: [401],
    body: {
      preferences: { sample: true },
    },
  },
  {
    name: "Dashboard summary GET (unauthorized)",
    method: "GET",
    path: "/api/dashboard/summary",
    expectedStatuses: [401],
  },
  {
    name: "Dashboard activity GET (unauthorized)",
    method: "GET",
    path: "/api/dashboard/activity",
    expectedStatuses: [401],
  },
  {
    name: "Dashboard analytics GET (unauthorized)",
    method: "GET",
    path: "/api/dashboard/analytics",
    expectedStatuses: [401],
  },
  {
    name: "Projects GET (unauthorized)",
    method: "GET",
    path: "/api/projects",
    expectedStatuses: [401],
  },
  {
    name: "Projects POST (unauthorized)",
    method: "POST",
    path: "/api/projects",
    expectedStatuses: [401],
    body: {
      name: "Smoke Project",
      description: "From API smoke test",
    },
  },
  {
    name: "Project by ID GET (unauthorized)",
    method: "GET",
    path: "/api/projects/non-existent-id",
    expectedStatuses: [401],
  },
  {
    name: "Project tasks GET (unauthorized)",
    method: "GET",
    path: "/api/projects/non-existent-id/tasks",
    expectedStatuses: [401],
  },
  {
    name: "Project tasks PATCH (unauthorized)",
    method: "PATCH",
    path: "/api/projects/non-existent-id/tasks",
    expectedStatuses: [401],
    body: {
      taskId: "non-existent",
      status: "done",
    },
  },
  {
    name: "Task proofs GET (unauthorized)",
    method: "GET",
    path: "/api/projects/non-existent-id/tasks/non-existent/proofs",
    expectedStatuses: [401],
  },
  {
    name: "Task proofs POST (unauthorized)",
    method: "POST",
    path: "/api/projects/non-existent-id/tasks/non-existent/proofs",
    expectedStatuses: [401],
    body: {
      fileUrl: "https://example.com/proof.pdf",
      type: "document",
      note: "Smoke proof",
    },
  },
];

async function run() {
  const failures: string[] = [];

  console.log(`Running ${tests.length} API route smoke tests against ${baseUrl}`);

  for (const test of tests) {
    const url = `${baseUrl}${test.path}`;
    const requestInit: RequestInit = {
      method: test.method,
      headers: {
        "content-type": "application/json",
      },
    };

    if (test.body !== undefined) {
      requestInit.body = JSON.stringify(test.body);
    }

    try {
      const response = await fetch(url, requestInit);
      const ok = test.expectedStatuses.includes(response.status);

      if (!ok) {
        failures.push(
          `${test.name} expected [${test.expectedStatuses.join(", ")}] but got ${response.status}`
        );
      }

      console.log(
        `${ok ? "PASS" : "FAIL"} ${test.method} ${test.path} -> ${response.status}`
      );
    } catch (error) {
      failures.push(`${test.name} failed with error: ${String(error)}`);
      console.log(`FAIL ${test.method} ${test.path} -> network error`);
    }
  }

  if (failures.length > 0) {
    console.error("\nAPI smoke tests failed:\n");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nAll API route smoke tests passed.");
}

run().catch((error) => {
  console.error("Unexpected test runner failure", error);
  process.exit(1);
});
