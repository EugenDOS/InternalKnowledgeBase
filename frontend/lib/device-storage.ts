export interface DeviceOwnerProfile {
  id: string
  fullName: string
  email: string
  username: string
}

const AGREEMENT_ACCEPTED_COOKIE = "knowledge-base-agreement-accepted"
const DEVICE_OWNER_COOKIE = "knowledge-base-device-owner"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

function canUseStorage(): boolean {
  return typeof document !== "undefined"
}

function getCookieValue(name: string): string | null {
  if (!canUseStorage()) return null

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))

  if (!cookie) return null

  return decodeURIComponent(cookie.slice(name.length + 1))
}

function setCookieValue(name: string, value: string): void {
  if (!canUseStorage()) return

  const securePart = window.location.protocol === "https:" ? "; secure" : ""
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${COOKIE_MAX_AGE_SECONDS}`,
    "samesite=lax",
    securePart,
  ].join("; ")
}

export function hasAcceptedAgreementOnDevice(): boolean {
  return getCookieValue(AGREEMENT_ACCEPTED_COOKIE) === "true"
}

export function markAgreementAcceptedOnDevice(): void {
  setCookieValue(AGREEMENT_ACCEPTED_COOKIE, "true")
}

export function getDeviceOwnerProfile(): DeviceOwnerProfile | null {
  const rawValue = getCookieValue(DEVICE_OWNER_COOKIE)
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue) as DeviceOwnerProfile
  } catch {
    return null
  }
}

export function setDeviceOwnerProfile(profile: DeviceOwnerProfile): void {
  setCookieValue(DEVICE_OWNER_COOKIE, JSON.stringify(profile))
}
