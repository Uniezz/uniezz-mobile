// The API matches up to 5 words of at least 3 characters; shorter words are dropped.
export function toSearchQuery(text: string): string | undefined {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length >= 3)
    .slice(0, 5);
  return words.length ? words.join(" ") : undefined;
}
