// keys are the backend's grant reasons; an unknown reason falls back to rewards.reasonOther
export const COIN_GRANT_REASON_LABELS: Record<string, string> = {
  welcome: "rewards.reasonWelcome",
  like_given: "rewards.reasonLikeGiven",
  like_received: "rewards.reasonLikeReceived",
  comment: "rewards.reasonComment",
  profile_complete: "rewards.reasonProfileComplete",
  birth_date: "rewards.reasonBirthDate",
  referral: "rewards.reasonReferral",
  daily_quests: "rewards.reasonDailyQuests",
  faq_approved: "rewards.reasonFaqApproved",
};

// keys are the backend's quest names; an unknown quest falls back to rewards.questOther
export const QUEST_LABELS: Record<string, string> = {
  like: "rewards.questLike",
  reply: "rewards.questReply",
  post: "rewards.questPost",
};
