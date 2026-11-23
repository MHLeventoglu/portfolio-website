import { useState } from 'react'
import { createPortal } from 'react-dom'
import { RefreshCw, WifiOff, X, Check } from 'lucide-react'
import { usePWA } from './PWAContext'
import './PWA.css'

export default function PWALayer() {
  const pwa = usePWA()
  const [updating, setUpdating] = useState(false), [updateError, setUpdateError] = useState('')
  const update = async () => {
    setUpdating(true); setUpdateError('')
    try { await pwa.updateServiceWorker(true) }
    catch { setUpdating(false); setUpdateError('Yeni sürüm açılamadı. İnternet bağlantınızı kontrol edin.') }
  }
  return createPortal(<>
    {(!pwa.online || pwa.needRefresh || pwa.reconnected) && <aside className="pwa-notice admin-theme" aria-label="Uygulama durumu" role="status">
      {!pwa.online ? <><WifiOff size={20} /><div><strong>Çevrimdışısınız</strong><p>Güncel veriler ve kayıt işlemleri için bağlantı gerekiyor.</p></div></> : pwa.needRefresh ? <><RefreshCw size={20} /><div><strong>Yeni sürüm hazır</strong><p>Kaydedilmemiş değişiklikleriniz varsa önce kaydedin.</p><button className="pwa-inline-action" disabled={updating} onClick={update}>{updating ? 'Yenileniyor…' : 'Uygulamayı yenile'}</button>{updateError && <p className="pwa-error">{updateError}</p>}</div><button className="pwa-close" onClick={() => pwa.setNeedRefresh(false)} aria-label="Güncellemeyi daha sonra yap"><X size={17} /></button></> : <><Check size={20} /><div><strong>Bağlantı geri geldi</strong><button className="pwa-inline-action" onClick={() => window.location.reload()}>Güncel verileri yükle</button></div><button className="pwa-close" onClick={() => pwa.setReconnected(false)} aria-label="Bağlantı bildirimini kapat"><X size={17} /></button></>}
    </aside>}
  </>, document.body)
}
