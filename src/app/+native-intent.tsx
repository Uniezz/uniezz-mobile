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
  } catch {
    return path;
  }

  return path;
}
