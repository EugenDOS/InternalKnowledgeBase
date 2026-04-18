"use client"

import { useEffect, useRef } from "react"
import { useAppDispatch } from "@/store/hooks"
import { restoreSessionThunk } from "@/store/slices/auth-slice"

export default function AuthHydrator() {
  const dispatch = useAppDispatch()
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return

    startedRef.current = true
    dispatch(restoreSessionThunk())
  }, [dispatch])

  return null
}
