import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useRef } from "react";
import type { ConnectionPreferences } from "@/@types";
import { useConnectionPreferences } from "./useConnections";

// the connections tab needs a birth date: asking for it replaces the first visit
export const useBirthDateGate = () => {
  const birthDateRef = useRef<BottomSheetModal>(null);
  const birthDateRequested = useRef(false);
  const queryClient = useQueryClient();
  const { data: preferences, isPending } = useConnectionPreferences();
  const isBirthDateMissing = !isPending && !preferences?.birthDate;

  // returns whether it took the press, so the caller can cancel the navigation
  const requestBirthDate = () => {
    if (!isBirthDateMissing) return false;
    birthDateRequested.current = true;
    birthDateRef.current?.present();
    return true;
  };

  // a saved date continues to the tab the student asked for
  const handleDismiss = () => {
    const requested = birthDateRequested.current;
    birthDateRequested.current = false;
    const saved = queryClient.getQueryData<ConnectionPreferences>([
      "connections",
      "me",
    ]);
    if (requested && saved?.birthDate) router.navigate("/(tabs)/meet");
  };

  return { birthDateRef, isBirthDateMissing, requestBirthDate, handleDismiss };
};
