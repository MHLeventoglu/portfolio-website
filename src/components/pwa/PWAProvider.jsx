import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { PWAContext } from './PWAContext'

export default function PWAProvider({ children }) {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [reconnected, setReconnected] = useState(false)
  const [registrationError, setRegistrationError] = useState(false)
  const [registered, setRegistered] = useState(false)
  const registration = useRef(null), lastUpdateCheck = useRef(0)
  const { needRefresh: [needRefresh, setNeedRefresh], offlineReady: [offlineReady], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, value) { registration.current = value; setRegistered(!!value?.active) },
    onRegisterError() { setRegistrationError(true) }
  })

  useEffect(() => {
    const offline = () => { setOnline(false); setReconnected(false) }
    const online = () => { setOnline(true); setReconnected(true) }
    const checkUpdate = () => {
      if (navigator.onLine && registration.current && Date.now() - lastUpdateCheck.current > 3600000) {
        lastUpdateCheck.current = Date.now()
        void registration.current.update().catch(() => {})
      }
    }
    window.addEventListener('offline', offline)
    window.addEventListener('online', online)
    window.addEventListener('focus', checkUpdate)
    return () => {
      window.removeEventListener('offline', offline)
      window.removeEventListener('online', online)
      window.removeEventListener('focus', checkUpdate)
    }
  }, [])

  return <PWAContext.Provider value={{ online, reconnected, setReconnected, ready: offlineReady || registered, registrationError, needRefresh, setNeedRefresh, updateServiceWorker }}>{children}</PWAContext.Provider>
}
