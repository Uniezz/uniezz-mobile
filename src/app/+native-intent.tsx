// only the module, not "@/utils": this runs before the app, and in tests without React Native
import { WEB_LINK_ROUTES } from "@/utils/links";

export function redirectSystemPath({
  path,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    const url = new URL(path, "uniezz://app/");
    const isUsosCallback =
      url.protocol === "uniezz:" &&
      ((url.hostname === "auth" && url.pathname === "/callback") ||
        (url.hostname === "app" && url.pathname === "/auth/callback"));

    if (isUsosCallback) {
      return `/finish${url.search}`;
    }

    const inviteCode =
      url.protocol === "uniezz:" && url.hostname === "invite"
        ? url.pathname.slice(1)
        : url.pathname.match(/^\/(?:--\/)?invite\/([A-Z0-9]{7})$/i)?.[1];
    if (inviteCode && /^[A-Z0-9]{7}$/i.test(inviteCode)) {
      // the invite screen decides: sign-up with the code, or apply it to the signed-in account
      return `/invite/${encodeURIComponent(inviteCode)}`;
    }

    // a shared post, student or course page opens its app screen; a page under it (an edit form)
    // opens the item itself, and one without an id (a new post) the app's start
    for (const [prefix, route] of WEB_LINK_ROUTES) {
      if (!url.pathname.startsWith(prefix)) continue;
      const id = url.pathname
        .slice(prefix.length)
        .match(/^[0-9a-f-]{36}(?=\/|$)/i)?.[0];
      return id ? `${route}/${id}` : "/";
    }
  } catch {
    return path;
  }

  return path;
}
