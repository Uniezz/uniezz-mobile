/**
 * A tiny mock "data source" so the Suspense / use() examples run without a
 * backend. It returns a cached promise (stable across renders, which the use()
 * API requires) that resolves after a short delay — or rejects, to exercise the
 * Error Boundary path.
 *
 * In a real app you'd replace this with TanStack Query's `useSuspenseQuery`,
 * which suspends while pending and throws on error in exactly the same way.
 */
export type MockUser = {
  id: string;
  name: string;
};

let cachedResource: Promise<MockUser> | null = null;
let shouldFail = false;

function createResource(): Promise<MockUser> {
  return new Promise<MockUser>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Failed to load the user. Tap to retry."));
      } else {
        resolve({ id: "1", name: "Ada Lovelace" });
      }
    }, 1500);
  });
}

/** Returns a stable promise suitable for reading with the React `use` API. */
export function getUserResource(): Promise<MockUser> {
  if (!cachedResource) {
    cachedResource = createResource();
  }
  return cachedResource;
}

/** Clears the cache so the next read starts a fresh request (used on retry). */
export function resetUserResource() {
  cachedResource = null;
}

/** Flip the mock into its failing state to demo the Error Boundary. */
export function setMockShouldFail(value: boolean) {
  shouldFail = value;
  cachedResource = null;
}
