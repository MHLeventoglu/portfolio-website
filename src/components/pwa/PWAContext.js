import { createContext, useContext } from 'react'

export const PWAContext = createContext(null)
export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) throw new Error('PWAProvider is required')
  return context
}
