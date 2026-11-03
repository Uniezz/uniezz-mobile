import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { IssuedSession } from "@/@types/auth";
import { api, setApiAccessToken } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  deleteStoredSession,
  loadStoredSession,
  storeSession,
  useChatStore,
} from "@/store";

type SessionContextValue = {
  session: IssuedSession | null;
  isLoading: boolean;
  saveSession: (session: IssuedSession) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
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
    useChatStore.getState().reset();
    setSession(nextSession);
    setApiAccessToken(nextSession.token);
  }, []);

  const clearSession = useCallback(async () => {
    useChatStore.getState().reset();
    setApiAccessToken(null);
    setSession(null);
    queryClient.clear();
    await deleteStoredSession();
  }, [queryClient]);

  useEffect(() => {
    if (!session?.token) return;
    const token = session.token;
    const middleware = {
      onResponse({
        request,
        response,
      }: {
        request: Request;
        response: Response;
      }) {
        if (
          response.status === 401 &&
          request.headers.get("Authorization") === `Bearer ${token}`
        ) {
          return clearSession();
        }
      },
    };
    api.use(middleware);
    return () => api.eject(middleware);
  }, [session?.token, clearSession]);

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
