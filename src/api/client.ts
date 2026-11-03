import createFetchClient, { type Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";
import type { paths } from "@/@types/schema";
import { env } from "@/schemas/env";
import { OTP_REQUEST_ERRORS, OTP_VERIFY_ERRORS } from "@/utils/otp";

export const API_BASE_URL = env.EXPO_PUBLIC_API_URL;

export class ApiRequestError extends Error {
  constructor(
    operation: string,
    detail: string,
    public readonly translationKey?: string,
    cause?: unknown,
    public readonly status?: number,
  ) {
    super(`${operation}: ${detail}`, { cause });
    this.name = "ApiRequestError";
  }
}

export function apiError(
  operation: string,
  response: Response,
  error?: { error: string },
  translationKey?: string,
): ApiRequestError {
  const status = `${response.status} ${response.statusText}`.trim();
  const detail = error
    ? `HTTP ${status}, backend code ${error.error}`
    : response.ok
      ? `HTTP ${status}, expected response body is missing`
      : `HTTP ${status}, backend returned no error body`;
  return new ApiRequestError(
    operation,
    detail,
    translationKey,
    error,
    response.status,
  );
}

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null): void {
  accessToken = token;
}

const apiMiddleware: Middleware = {
  onRequest({ request, schemaPath }) {
    if (!accessToken || schemaPath.startsWith("/auth/")) {
      return;
    }

    request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
  async onResponse({ request, response, schemaPath }) {
    if (response.ok) {
      if (response.status === 204) {
        const allowsNoContent =
          (request.method === "POST" && schemaPath === "/auth/otp/request") ||
          (request.method === "DELETE" &&
            [
              "/feed/comments/{id}",
              "/feed/posts/{id}",
              "/profile/avatar",
              "/profile/programmes/{id}",
            ].includes(schemaPath));
        if (!allowsNoContent) {
          throw apiError(`${request.method} ${schemaPath}`, response);
        }
      } else if (request.method !== "HEAD") {
        const body = (await response.clone().text()).trim();
        if (!body || body === "null") {
          throw apiError(`${request.method} ${schemaPath}`, response);
        }
      }
      return;
    }
    if (
      request.method === "DELETE" &&
      schemaPath === "/profile/programmes/{id}" &&
      response.status === 404
    ) {
      return;
    }

    const body: unknown = await response
      .clone()
      .json()
      .catch(() => null);
    const code =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : undefined;
    const translationKey =
      schemaPath === "/auth/otp/request"
        ? (OTP_REQUEST_ERRORS[response.status] ?? "otp.sendFailed")
        : schemaPath === "/auth/otp/verify"
          ? (OTP_VERIFY_ERRORS[response.status] ?? "otp.verifyFailed")
          : undefined;
    throw apiError(
      `${request.method} ${schemaPath}`,
      response,
      code ? { error: code } : undefined,
      translationKey,
    );
  },
  onError({ request, schemaPath, error }) {
    const translationKey =
      schemaPath === "/auth/otp/request"
        ? "otp.sendFailed"
        : schemaPath === "/auth/otp/verify"
          ? "otp.verifyFailed"
          : undefined;
    return new ApiRequestError(
      `${request.method} ${schemaPath}`,
      `request failed before an HTTP response: ${error instanceof Error ? error.message : String(error)}`,
      translationKey,
      error,
    );
  },
};

export const api = createFetchClient<paths>({ baseUrl: API_BASE_URL });
api.use(apiMiddleware);

export const $api = createQueryClient(api);
