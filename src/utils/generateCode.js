import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique public username
 * @param {string} prefix - Optional prefix for the username
 * @returns {string} - A unique username
 */
export function generatePublicUsername(prefix = "user") {
  const uuid = uuidv4().split("-")[0]; // Get first 8 characters of UUID
  return `${prefix}_${uuid}`;
}

/**
 * Generate a short unique code
 * @returns {string}
 */
export function generateShortCode() {
  return uuidv4().split("-")[0];
}

export default { generatePublicUsername, generateShortCode };
