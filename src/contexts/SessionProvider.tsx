import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { IssuedSession } from "@/@types";
import { api, setApiAccessToken } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-react-native";
import { captureAction } from "@/utils";
import { useRequestNotificationPermission } from "@/hooks/useNotifications";
import { deleteStoredSession, loadStoredSession, storeSession } from "@/store";

type SessionContextValue = {
  session: IssuedSession | null;
  isLoading: boolean;
  saveSession: (session: IssuedSession) => Promise<void>;
  clearSession: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const posthog = usePostHog();
  const { mutate: requestNotifications } = useRequestNotificationPermission();
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
        if (!storedSession) return;
        // a student never asked gets the prompt; an allowed device re-registers its token, as Expo may
        // replace it; a refused one stays silent
        requestNotifications();
      });

    return () => {
      isMounted = false;
    };
  }, [requestNotifications]);

  const saveSession = useCallback(
    async (nextSession: IssuedSession) => {
      captureAction(posthog, "session_save", "attempted");
      try {
        await storeSession(nextSession);
        setSession(nextSession);
        setApiAccessToken(nextSession.token);
        captureAction(posthog, "session_save", "succeeded");
      } catch (error) {
        captureAction(posthog, "session_save", "failed");
        throw error;
      }
    },
    [posthog],
  );

  const clearSession = useCallback(async () => {
    captureAction(posthog, "session_clear", "attempted");
    setApiAccessToken(null);
    setSession(null);
    queryClient.clear();
    try {
      await deleteStoredSession();
      captureAction(posthog, "session_clear", "succeeded");
    } catch (error) {
      captureAction(posthog, "session_clear", "failed");
      throw error;
    } finally {
      try {
        posthog.reset();
      } catch {
        // Analytics must not mask a session storage failure.
      }
    }
  }, [queryClient, posthog]);

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
