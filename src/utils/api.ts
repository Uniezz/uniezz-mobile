export function requireApiData<T>(
  data: T | null | undefined,
  error: { error: string } | null | undefined,
  resource: string,
): T {
  if (error != null) {
    throw new Error(error.error);
  }
  if (data == null) {
    throw new Error(`The ${resource} API returned no data.`);
  }
  return data;
}
