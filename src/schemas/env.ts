import * as z from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url(),
  EXPO_PUBLIC_PROJECT_TOKEN: z.string().startsWith("phc_"),
});

export const env = envSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_PROJECT_TOKEN: process.env.EXPO_PUBLIC_PROJECT_TOKEN,
});
