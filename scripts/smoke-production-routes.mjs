const baseUrl = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");

async function check(path, { allowedStatuses = [200], inspect } = {}) {
  const response = await fetch(new URL(path, baseUrl), { redirect: "manual" });
  if (!allowedStatuses.includes(response.status)) {
    throw new Error(`${path}: expected HTTP ${allowedStatuses.join(" or ")}, received ${response.status}`);
  }
  const body = await response.text();
  if (inspect) inspect(body, response);
  console.log(`PASS ${path} -> HTTP ${response.status}`);
}

await check("/api/health", {
  inspect(body) {
    const health = JSON.parse(body);
    if (health.ok !== true || health.service !== "shopes") {
      throw new Error("/api/health did not return the expected Shopes health payload");
    }
    if (health.routes?.aiLab !== "/ai-small") {
      throw new Error("/api/health does not advertise the AI Lab route");
    }
  },
});

await check("/ai-small", {
  inspect(body) {
    if (!body.includes("PRIVATE, IN-BROWSER AI") || !body.includes("SmolLM2")) {
      throw new Error("/ai-small returned HTML but the expected AI Lab content was not found");
    }
  },
});

await check("/", {
  allowedStatuses: [200, 301, 302, 307, 308],
});

await check("/keyword-research", {
  allowedStatuses: [200, 301, 302, 307, 308],
});
