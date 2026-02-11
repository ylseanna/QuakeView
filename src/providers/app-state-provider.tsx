'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { AppStateStore, createAppStore } from '@/stores/app-state'

export type AppStoreApi = ReturnType<typeof createAppStore>

export const AppStoreContext = createContext<AppStoreApi | undefined>(
  undefined,
)

export interface AppStoreProviderProps {
  children: ReactNode
}

export const AppStateStoreProvider = ({
  children,
}: AppStoreProviderProps) => {
  const storeRef = useRef<AppStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createAppStore()
  }

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  )
}

export const useAppStateStore = <T,>(
  selector: (store: AppStateStore) => T,
): T => {
  const appStoreContext = useContext(AppStoreContext)

  if (!appStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`)
  }

  return useStore(appStoreContext, selector)
}