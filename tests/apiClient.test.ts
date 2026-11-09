/// <reference types="node" />
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

process.env.EXPO_PUBLIC_API_URL = "https://api.test";
process.env.EXPO_PUBLIC_PROJECT_TOKEN = "phc_test";

// openapi-fetch reads globalThis.fetch when the client is created, so install a
// stable dispatcher before importing it and swap the handler per test.
type FetchHandler = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

let handleFetch: FetchHandler = async () => {
  throw new Error("test did not install a fetch handler");
};
globalThis.fetch = ((input, init) => handleFetch(input, init)) as typeof fetch;

const { api, ApiRequestError, setApiAccessToken } =
  await import("../src/api/client");

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  setApiAccessToken(null);
});

test("adds the access token to API requests but not to auth endpoints", async () => {
  const headers: (string | null)[] = [];
  handleFetch = async (input) => {
    const request = input as Request;
    headers.push(request.headers.get("Authorization"));
    return jsonResponse(200, { items: [] });
  };
  setApiAccessToken("secret");

  await api.GET("/feed/posts", { params: { query: {} } });
  await api.POST("/auth/otp/request", {
    body: { email: "a@b.c", university: "kul" },
  });

  assert.deepEqual(headers, ["Bearer secret", null]);
});

test("turns an HTTP error into ApiRequestError with status, operation, and backend code", async () => {
  handleFetch = async () => jsonResponse(401, { error: "unauthorized" });

  const error = await api.GET("/feed/posts", { params: { query: {} } }).then(
    () => assert.fail("expected the request to reject"),
    (reason: unknown) => reason,
  );

  assert.ok(error instanceof ApiRequestError);
  assert.equal(error.name, "ApiRequestError");
  assert.equal(error.status, 401);
  assert.match(error.message, /^GET \/feed\/posts: HTTP 401/);
  assert.match(error.message, /backend code unauthorized/);
});

test("uses the endpoint translation key for a mapped status and falls back", async () => {
  handleFetch = async () => jsonResponse(429, { error: "too_many" });

  const mapped = await api
    .POST("/auth/otp/request", { body: { email: "a@b.c", university: "kul" } })
    .catch((reason: unknown) => reason);

  assert.ok(mapped instanceof ApiRequestError);
  assert.equal(mapped.translationKey, "otp.tooManyRequests");

  handleFetch = async () => jsonResponse(500, { error: "internal" });

  const unmapped = await api
    .POST("/auth/otp/request", { body: { email: "a@b.c", university: "kul" } })
    .catch((reason: unknown) => reason);

  assert.ok(unmapped instanceof ApiRequestError);
  assert.equal(unmapped.translationKey, "otp.sendFailed");
});

test("rejects a successful response that has no body", async () => {
  handleFetch = async () => new Response(null, { status: 200 });

  const error = await api
    .GET("/feed/posts", { params: { query: {} } })
    .catch((reason: unknown) => reason);

  assert.ok(error instanceof ApiRequestError);
  assert.equal(error.status, 200);
  assert.match(error.message, /expected response body is missing/);
});

test("accepts a 204 for endpoints that allow no content", async () => {
  handleFetch = async () => new Response(null, { status: 204 });

  const result = await api.DELETE("/feed/posts/{id}", {
    params: { path: { id: "post-1" } },
  });

  assert.equal(result.response.status, 204);
});

test("rejects a 204 where a response body is required", async () => {
  handleFetch = async () => new Response(null, { status: 204 });

  const error = await api
    .GET("/feed/posts", { params: { query: {} } })
    .catch((reason: unknown) => reason);

  assert.ok(error instanceof ApiRequestError);
  assert.match(error.message, /expected response body is missing/);
});

test("preserves network failures as ApiRequestError with the original cause", async () => {
  const cause = new TypeError("Network request failed");
  handleFetch = async () => {
    throw cause;
  };

  const error = await api
    .GET("/feed/posts", { params: { query: {} } })
    .catch((reason: unknown) => reason);

  assert.ok(error instanceof ApiRequestError);
  assert.equal(error.cause, cause);
  assert.match(
    error.message,
    /request failed before an HTTP response: Network request failed/,
  );
});
