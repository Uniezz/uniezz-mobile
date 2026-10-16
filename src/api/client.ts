import createFetchClient, { type Middleware } from "openapi-fetch";
import createQueryClient from "openapi-react-query";
import type { paths } from "@/@types/schema";
import { env } from "@/schemas/env";

export const API_BASE_URL = env.EXPO_PUBLIC_API_URL;

let accessToken: string | null = null;

export function setApiAccessToken(token: string | null): void {
  accessToken = token;
}

const authMiddleware: Middleware = {
  onRequest({ request, schemaPath }) {
    if (!accessToken || schemaPath.startsWith("/auth/")) {
      return;
    }

    request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
};

export const api = createFetchClient<paths>({ baseUrl: API_BASE_URL });
api.use(authMiddleware);

export const $api = createQueryClient(api);
