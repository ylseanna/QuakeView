'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type DataStore, createDataStore } from '@/stores/data-store'

export type DataStoreApi = ReturnType<typeof createDataStore>

export const DataStoreContext = createContext<DataStoreApi | undefined>(
  undefined,
)

export interface CounterStoreProviderProps {
  children: ReactNode
}

export const DataStoreProvider = ({
  children,
}: CounterStoreProviderProps) => {
  const storeRef = useRef<DataStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createDataStore()
  }

  return (
    <DataStoreContext.Provider value={storeRef.current}>
      {children}
    </DataStoreContext.Provider>
  )
}

export const useDataStore = <T,>(
  selector: (store: DataStore) => T,
): T => {
  const dataStoreContext = useContext(DataStoreContext)

  if (!dataStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`)
  }

  return useStore(dataStoreContext, selector)
}