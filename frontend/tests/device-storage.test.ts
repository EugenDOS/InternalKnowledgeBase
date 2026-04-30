import { afterEach, describe, expect, it, vi } from "vitest"
import {
  getDeviceOwnerProfile,
  hasAcceptedAgreementOnDevice,
  markAgreementAcceptedOnDevice,
  setDeviceOwnerProfile,
  type DeviceOwnerProfile,
} from "@/lib/device-storage"

const profile: DeviceOwnerProfile = {
  id: "user-1",
  fullName: "Иван Иванов",
  email: "ivan@company.ru",
  username: "ivan",
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim()
    if (name) {
      document.cookie = `${name}=; path=/; max-age=0`
    }
  })
})

describe("device storage", () => {
  it("stores agreement acceptance in a cookie", () => {
    expect(hasAcceptedAgreementOnDevice()).toBe(false)

    markAgreementAcceptedOnDevice()

    expect(hasAcceptedAgreementOnDevice()).toBe(true)
  })

  it("stores and reads device owner profile", () => {
    expect(getDeviceOwnerProfile()).toBeNull()

    setDeviceOwnerProfile(profile)

    expect(getDeviceOwnerProfile()).toEqual(profile)
  })

  it("returns null for malformed profile cookie", () => {
    document.cookie = "knowledge-base-device-owner=%7B; path=/"

    expect(getDeviceOwnerProfile()).toBeNull()
  })

  it("does nothing when document is unavailable", () => {
    vi.stubGlobal("document", undefined)

    markAgreementAcceptedOnDevice()
    setDeviceOwnerProfile(profile)

    expect(hasAcceptedAgreementOnDevice()).toBe(false)
    expect(getDeviceOwnerProfile()).toBeNull()
  })

  it("adds secure flag on https pages", () => {
    window.location.href = "https://localhost/"

    markAgreementAcceptedOnDevice()

    expect(document.cookie).toContain("knowledge-base-agreement-accepted=true")
  })
})
