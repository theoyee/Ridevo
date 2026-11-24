import { parsePhoneNumberFromString } from "libphonenumber-js/max";

export const COUNTRY_CODE = "+234";
export const DEFAULT_COUNTRY = "NG";

function parseNigerianPhone(value: string) {
  let input = value.trim().replace(/[\s()-]/g, "");

  if (!/^\+?\d+$/.test(input)) {
    return null;
  }

  if (input.startsWith("234")) {
    input = `+${input}`;
  }

  const phone = parsePhoneNumberFromString(input, DEFAULT_COUNTRY);

  if (!phone || phone.country !== DEFAULT_COUNTRY || !phone.isValid()) {
    return null;
  }

  const type = phone.getType();

  if (type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE") {
    return null;
  }

  return phone;
}

/**
 * Normalize a Nigerian mobile number to E.164 format.
 */
export function normalizePhoneNumber(value: string): string | null {
  return parseNigerianPhone(value)?.number ?? null;
}

/**
 * Validate a Nigerian mobile number.
 */
export function isValidPhoneNumber(value: string): boolean {
  return normalizePhoneNumber(value) !== null;
}

/**
 * Format a phone number for international display.
 */
export function formatPhoneNumber(value: string): string {
  return parseNigerianPhone(value)?.formatInternational() ?? value;
}

/**
 * Format a phone number for local display.
 */
export function formatLocalPhoneNumber(value: string): string {
  return parseNigerianPhone(value)?.formatNational() ?? value;
}

/**
 * Extract the number without the country code.
 */
export function getNationalNumber(value: string): string | null {
  return parseNigerianPhone(value)?.nationalNumber ?? null;
}

/**
 * Mask a phone number for privacy.
 */
export function maskPhoneNumber(value: string): string {
  const phone = parseNigerianPhone(value);

  if (!phone) return "Invalid phone number";

  const number = phone.nationalNumber;

  return `${COUNTRY_CODE} ${number.slice(0, 3)} **** ${number.slice(-3)}`;
}
