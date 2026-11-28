// the actions (mutation analyticsAction names) and post opens that count toward asking once for a store
// rating: things a student does because the app is of use, not background work such as marking a chat read
export const REVIEW_ACTIONS = new Set([
  "post_like_set",
  "post_save_set",
  "post_create",
  "comment_create",
  "chat_message_send",
  "chat_group_create",
  "profile_follow",
  "connection_act",
  "course_rate",
  "course_comment_create",
  "professor_rate",
  "professor_review",
  "faq_propose",
]);

// counted actions before the rating sheet is asked for, so it never comes on the first tap
export const REVIEW_AFTER_ACTIONS = 5;
