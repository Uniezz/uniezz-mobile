import { ApiRequestError } from "@/api/client";
import i18n from "@/internationalization";

// the localized message key for a failed request: the endpoint's own key when it has a translation, else `fallback`
export const apiErrorKey = (error: unknown, fallback = "apiState.error") =>
  error instanceof ApiRequestError &&
  error.translationKey &&
  i18n.exists(error.translationKey)
    ? error.translationKey
    : fallback;
