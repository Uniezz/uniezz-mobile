export function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof error.error === "string"
  ) {
    return error.error;
  }

  return error instanceof Error ? error.message : "Please try again.";
}
