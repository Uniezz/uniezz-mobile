// a random UUID v4 for Idempotency-Key headers; Hermes has no global `crypto`, so crypto.randomUUID() throws
// shortcut: Math.random, not a secure RNG; fine for a retry key, swap for expo-crypto if a key ever needs to be unguessable
export const idempotencyKey = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
