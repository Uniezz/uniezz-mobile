import { createMMKV } from "react-native-mmkv";

const storage = createMMKV();
const doneKey = (userId: string) => `uniezz.onboarding-done.${userId}`;

// shortcut: kept on this device only, as on web; a backend flag would close onboarding on every device
export const isOnboardingDone = (userId: string) =>
  storage.getBoolean(doneKey(userId)) === true;

export const markOnboardingDone = (userId: string) =>
  storage.set(doneKey(userId), true);
