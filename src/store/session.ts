import * as SecureStore from "expo-secure-store";
import type { IssuedSession } from "@/@types/auth";

const SESSION_STORAGE_KEY = "uniezz.session";

function isIssuedSession(value: unknown): value is IssuedSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const session = value as Record<string, unknown>;
  return (
    typeof session.token === "string" &&
    session.token.length > 0 &&
    typeof session.expiresAt === "string" &&
    Number.isFinite(Date.parse(session.expiresAt))
  );
}

export async function loadStoredSession(): Promise<IssuedSession | null> {
  const storedSession = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  if (!storedSession) {
    return null;
  }

  let session: unknown;
  try {
    session = JSON.parse(storedSession);
  } catch {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    return null;
  }

  if (
    !isIssuedSession(session) ||
    Date.parse(session.expiresAt) <= Date.now()
  ) {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    return null;
  }

  return session;
}

export async function storeSession(session: IssuedSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function deleteStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}
