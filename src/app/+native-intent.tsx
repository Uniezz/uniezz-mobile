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
  } catch {
    return path;
  }

  return path;
}
