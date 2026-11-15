import type { components } from "./schema";

export type CoinGrant = components["schemas"]["CoinGrant"];
export type CoinGrantsPage =
  components["schemas"]["ListMyCoinGrantsOutputBody"];
export type DailyQuests = components["schemas"]["DailyQuests"];
export type QuestProgress = components["schemas"]["QuestProgress"];
export type RedeemInviteInput = components["schemas"]["RedeemInviteInputBody"];
export type RedeemInviteResult =
  components["schemas"]["RedeemInviteOutputBody"];
export type RedeemInviteFormValues = { code: string };
