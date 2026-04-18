// ==========================================
// Типизированные хуки для Redux
// Практика 5: useSelector и useDispatch
// ==========================================
//
// Использование вместо стандартных хуков из react-redux:
//   import { useAppSelector, useAppDispatch } from "@/store/hooks"

import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "./index"

// useAppDispatch — типизированный dispatch, знает типы всех action creators
export const useAppDispatch = () => useDispatch<AppDispatch>()

// useAppSelector — типизированный selector, выводит тип из RootState
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
    useSelector(selector)
