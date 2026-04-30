import { describe, expect, it, vi } from "vitest"
import reducer, {
  confirmAgreement,
  resetAgreement,
  setAccepted,
} from "@/store/slices/agreement-slice"

describe("agreement slice", () => {
  it("accepts, confirms and resets agreement", () => {
    vi.setSystemTime(new Date("2026-04-30T10:00:00.000Z"))

    let state = reducer(undefined, setAccepted(true))
    expect(state).toMatchObject({ isAccepted: true, isConfirmed: false, confirmedAt: null })

    state = reducer(state, confirmAgreement())
    expect(state).toEqual({
      isAccepted: true,
      isConfirmed: true,
      confirmedAt: "2026-04-30T10:00:00.000Z",
    })

    state = reducer(state, resetAgreement())
    expect(state).toEqual({ isAccepted: false, isConfirmed: false, confirmedAt: null })

    vi.useRealTimers()
  })

  it("does not confirm agreement before acceptance and clears confirmation on reject", () => {
    let state = reducer(undefined, confirmAgreement())
    expect(state).toEqual({ isAccepted: false, isConfirmed: false, confirmedAt: null })

    state = reducer({ isAccepted: true, isConfirmed: true, confirmedAt: "date" }, setAccepted(false))
    expect(state).toEqual({ isAccepted: false, isConfirmed: false, confirmedAt: null })
  })
})
