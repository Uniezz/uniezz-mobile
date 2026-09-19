import { createContext, useState, useEffect } from "react";

export const SessionContext = createContext<{ session: any | null }>({
  session: null,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);

  useEffect(() => {
    // TODO: Implement custom backend session check here
  }, []);

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}
