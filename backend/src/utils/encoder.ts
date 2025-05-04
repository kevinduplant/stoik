import { randomBytes } from "crypto";

// Base62 character set (0-9, a-z, A-Z)
const CHARSET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generate a short, unique ID for URLs
 * Using 8 characters gives us 62^8 (approx. 218 trillion combinations)
 */
export function generateShortId(length: number = 8): string {
  let result = "";
  const bytes = randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }

  return result;
}
