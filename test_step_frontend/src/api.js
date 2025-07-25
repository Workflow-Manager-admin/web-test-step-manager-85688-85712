//
// API helpers for test step and suite management (RESTful)
//
const API_BASE =
  process.env.REACT_APP_TEST_STEP_BACKEND_URL ||
  "http://localhost:3001"; // can override for deployment

// Helper to handle errors nicely
async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = "Error " + response.status;
    try {
      const data = await response.json();
      errorMsg = data.message || JSON.stringify(data);
    } catch (e) {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

// --- Suites ---
// PUBLIC_INTERFACE
export async function fetchSuites() {
  /** Get the list of suites for the logged-in user */
  const res = await fetch(`${API_BASE}/suites/`);
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function createSuite(suite) {
  /** Create a new suite {name, description} */
  const res = await fetch(`${API_BASE}/suites/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(suite),
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function updateSuite(suiteId, suite) {
  /** Update suite name/description by id */
  const res = await fetch(`${API_BASE}/suites/${suiteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(suite),
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function deleteSuite(suiteId) {
  /** Delete suite and all its steps */
  const res = await fetch(`${API_BASE}/suites/${suiteId}`, {
    method: "DELETE"
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function getSuite(suiteId) {
  /** Get details (including steps) of a suite */
  const res = await fetch(`${API_BASE}/suites/${suiteId}`);
  return handleResponse(res);
}

// --- Test Steps ---
// PUBLIC_INTERFACE
export async function fetchTestSteps({ suiteId = null, q = "", order = "", page = 1, perPage = 20 } = {}) {
  /** List/filter test steps */
  let url = `${API_BASE}/steps/?page=${page}&per_page=${perPage}`;
  if (suiteId) url += `&suite_id=${suiteId}`;
  if (q) url += `&q=${encodeURIComponent(q)}`;
  if (order) url += `&order=${encodeURIComponent(order)}`;
  const res = await fetch(url);
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function createTestStep(step) {
  /** Create test step. step: {title, description, suite_id?, order?} */
  const res = await fetch(`${API_BASE}/steps/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(step),
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function getTestStep(stepId) {
  /** Get details of a step by id */
  const res = await fetch(`${API_BASE}/steps/${stepId}`);
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function updateTestStep(stepId, step) {
  /** Update test step by id. step: {title, description, order?} */
  const res = await fetch(`${API_BASE}/steps/${stepId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(step),
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function deleteTestStep(stepId) {
  /** Delete one test step */
  const res = await fetch(`${API_BASE}/steps/${stepId}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
