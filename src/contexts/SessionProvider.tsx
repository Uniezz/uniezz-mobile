import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { IssuedSession } from "@/@types/auth";
import { setApiAccessToken } from "@/api";
import { deleteStoredSession, loadStoredSession, storeSession } from "@/store";

type SessionContextValue = {
  session: IssuedSession | null;
  isLoading: boolean;
  saveSession: (session: IssuedSession) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<IssuedSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadStoredSession()
      .catch(() => null)
      .then((storedSession) => {
        if (!isMounted) {
          return;
        }

        setSession(storedSession);
        setApiAccessToken(storedSession?.token ?? null);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSession = useCallback(async (nextSession: IssuedSession) => {
    await storeSession(nextSession);
    setSession(nextSession);
    setApiAccessToken(nextSession.token);
  }, []);

  const clearSession = useCallback(async () => {
    setApiAccessToken(null);
    setSession(null);
    await deleteStoredSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{ session, isLoading, saveSession, clearSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider.");
  }

  return context;
}
