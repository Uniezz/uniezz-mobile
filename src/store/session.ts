import * as SecureStore from "expo-secure-store";
import type { IssuedSession } from "@/@types/auth";
import { z } from "zod";

const SESSION_STORAGE_KEY = "uniezz.session";

const issuedSessionSchema: z.ZodType<IssuedSession> = z.strictObject({
  token: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
});

export async function loadStoredSession(): Promise<IssuedSession | null> {
  const storedSession = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  if (!storedSession) {
    return null;
  }

  let storedValue: unknown;
  try {
    storedValue = JSON.parse(storedSession);
  } catch {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    return null;
  }

  const parsed = issuedSessionSchema.safeParse(storedValue);
  if (!parsed.success || Date.parse(parsed.data.expiresAt) <= Date.now()) {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    return null;
  }

  return parsed.data;
}

export async function storeSession(session: IssuedSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function deleteStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}
