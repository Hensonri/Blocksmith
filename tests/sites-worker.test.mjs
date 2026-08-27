import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

function usageDatabase(capture) {
  return {
    prepare(sql) {
      capture.sql = sql;
      return {
        bind(...values) {
          capture.values = values;
          return this;
        },
        async run() {
          capture.runs = (capture.runs || 0) + 1;
          return { success: true };
        },
      };
    },
  };
}

test("records anonymous online opens by platform", async () => {
  const capture = {};
  const response = await worker.fetch(new Request("https://example.test/api/usage", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.test" },
    body: JSON.stringify({ eventType: "online_open", platform: "Linux", variant: "" }),
  }), { DB: usageDatabase(capture) });

  assert.equal(response.status, 204);
  assert.match(capture.sql, /ON CONFLICT/);
  assert.deepEqual(capture.values.slice(0, 3), ["online_open", "Linux", ""]);
  assert.equal(capture.runs, 1);
});

test("records STL exports without receiving model or customer data", async () => {
  const capture = {};
  const response = await worker.fetch(new Request("https://example.test/api/usage", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.test" },
    body: JSON.stringify({ eventType: "stl_export", platform: "Windows", variant: "full-scale" }),
  }), { DB: usageDatabase(capture) });

  assert.equal(response.status, 204);
  assert.deepEqual(capture.values.slice(0, 3), ["stl_export", "Windows", "full-scale"]);
});

test("refuses unsupported and cross-origin usage events", async () => {
  const badEvent = await worker.fetch(new Request("https://example.test/api/usage", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.test" },
    body: JSON.stringify({ eventType: "customer_name", platform: "Linux", variant: "" }),
  }), { DB: usageDatabase({}) });
  assert.equal(badEvent.status, 400);

  const crossOrigin = await worker.fetch(new Request("https://example.test/api/usage", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://other.test" },
    body: JSON.stringify({ eventType: "online_open", platform: "Linux", variant: "" }),
  }), { DB: usageDatabase({}) });
  assert.equal(crossOrigin.status, 403);
});

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
  await access(new URL("../dist/.openai/drizzle", import.meta.url));
});
