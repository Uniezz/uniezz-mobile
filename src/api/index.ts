import createFetchClient, { type Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";
import type { paths } from "@/@types/schema";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

const authMiddleware: Middleware = {
  onRequest({ request, schemaPath }) {
    if (!baseUrl) {
      throw new Error(
        "EXPO_PUBLIC_API_URL must be set before making API requests.",
      );
    }

    if (!accessToken || schemaPath.startsWith("/auth/")) {
      return;
    }

    request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
};

export const api = createFetchClient<paths>({ baseUrl: baseUrl ?? "" });
api.use(authMiddleware);

export const $api = createQueryClient(api);
