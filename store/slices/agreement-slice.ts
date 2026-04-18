import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AgreementState } from "@/lib/types"

const initialState: AgreementState = {
  isAccepted: false,
  isConfirmed: false,
  confirmedAt: null,
}

const agreementSlice = createSlice({
  name: "agreement",
  initialState,
  reducers: {
    setAccepted(state, action: PayloadAction<boolean>) {
      state.isAccepted = action.payload

      if (!action.payload) {
        state.isConfirmed = false
        state.confirmedAt = null
      }
    },
    confirmAgreement(state) {
      if (!state.isAccepted) return

      state.isConfirmed = true
      state.confirmedAt = new Date().toISOString()
    },
    resetAgreement(state) {
      state.isAccepted = false
      state.isConfirmed = false
      state.confirmedAt = null
    },
  },
})

export const { setAccepted, confirmAgreement, resetAgreement } = agreementSlice.actions
export default agreementSlice.reducer
