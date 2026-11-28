// kept apart from ./chat, which imports the API client that reads these maps
// until the recipient accepts, a message request holds one text message without links or photos
export const CHAT_SEND_CODES: Record<string, string> = {
  request_pending: "chat.requestPending",
  rate_limited: "chat.rateLimit",
};

// 404: the student takes no message requests from you, by their "who can message me" setting;
// a 409 from opening a direct chat means a request is needed, which useOpenDirectChat handles
export const CHAT_DIRECT_ERRORS: Record<number, string> = {
  404: "chat.cannotMessage",
};

export const CHAT_REQUEST_ERRORS: Record<number, string> = {
  404: "chat.cannotMessage",
  429: "chat.rateLimit",
};
