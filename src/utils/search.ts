export function matchesSearch(query: string, ...values: string[]): boolean {
  return values
    .join(" ")
    .toLocaleLowerCase()
    .includes(query.trim().toLocaleLowerCase());
}
