import * as Haptics from "expo-haptics";
import { useHapticsStore } from "@/store/hapticsStore";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import type { CoinGrant, MyChallenge } from "@/@types";
import i18n from "@/internationalization";
// the file, not the @/ui barrel: ui imports @/utils back, so the barrel cycles
import { UICoin } from "@/ui/UICoin";

// an https link opens the app where it's installed (associated domains, verified app links) and the web sign-up elsewhere
export const inviteUrl = (code: string) =>
  `https://uniezz.pl/invite/${encodeURIComponent(code)}`;

// every reason the schema lists; the backend may add more, so lookups still fall back to rewards.reasonOther
export const COIN_GRANT_REASON_LABELS: Record<string, string> = {
  welcome: "rewards.reasonWelcome",
  like_given: "rewards.reasonLikeGiven",
  like_received: "rewards.reasonLikeReceived",
  comment: "rewards.reasonComment",
  profile_complete: "rewards.reasonProfileComplete",
  birth_date: "rewards.reasonBirthDate",
  referral: "rewards.reasonReferral",
  referral_joined: "rewards.reasonReferralJoined",
  daily_quests: "rewards.reasonDailyQuests",
  faq_approved: "rewards.reasonFaqApproved",
} satisfies Record<CoinGrant["reason"], string>;

// keys are the backend's quest names; an unknown quest falls back to rewards.questOther
export const QUEST_LABELS: Record<string, string> = {
  like: "rewards.questLike",
  reply: "rewards.questReply",
  post: "rewards.questPost",
};

// a challenge's text in the student's language, else Polish as the API asks, else any
export const challengeText = (
  texts: MyChallenge["texts"],
  language: string | undefined,
) =>
  (language ? texts[language] : undefined) ??
  texts.pl ??
  Object.values(texts)[0];

export const CHALLENGE_PERIOD_LABELS = {
  day: "rewards.challengeDaily",
  week: "rewards.challengeWeekly",
  once: null,
} as const satisfies Record<MyChallenge["period"], string | null>;

// likes, replies, posts, preferences and profile updates answer with the coins they paid
export const toastCoinsEarned = (data: unknown) => {
  if (
    data &&
    typeof data === "object" &&
    "coinsEarned" in data &&
    typeof data.coinsEarned === "number" &&
    data.coinsEarned > 0
  ) {
    toast.success(i18n.t("rewards.earned", { count: data.coinsEarned }), {
      icon: <UICoin />,
      styles: coinToastStyles,
    });
    if (useHapticsStore.getState().enabled) {
      return Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
    }
  }
};

// amber like the balance pill, so a coin toast reads apart from the plain white ones
const coinToastStyles = StyleSheet.create((theme) => ({
  toast: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.amber30,
    borderWidth: 1,
    borderRadius: theme.vs(16),
  },
  title: { color: theme.colors.amber },
}));
