import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { createFinanceDemo, FINANCE_STORAGE_KEY, accounts } from '../../lib/financeDemo'
import { migrateFinanceData, investmentSnapshot, upsertInvestmentSnapshot } from '../../lib/financePortfolio'
import { createEmptyFinance, createFinanceRepository, financeError } from '../../lib/financeWorkspace'

const repository = supabase ? createFinanceRepository(supabase) : null
const demoAllowed = import.meta.env.DEV && !supabase

function initialData() {
  if (!demoAllowed) return createEmptyFinance()
  try {
    const data = migrateFinanceData(JSON.parse(localStorage.getItem(FINANCE_STORAGE_KEY)), createFinanceDemo())
    return { ...data, accounts: data.accounts || accounts }
  } catch { return { ...createFinanceDemo(), accounts } }
}

export default function useFinanceWorkspace(ownerId) {
  const [snapshot, setSnapshot] = useState(() => ({ data: initialData(), loading: !demoAllowed, saving: false, error: null, updatedAt: null }))
  const current = useRef(snapshot), busy = useRef(false), mounted = useRef(false), loadSequence = useRef(null)
  const publish = useCallback(patch => { current.current = { ...current.current, ...patch }; if (mounted.current) setSnapshot(current.current) }, [])

  const reload = useCallback(async () => {
    if (busy.current) return false
    if (!repository || !ownerId) {
      publish({ loading: false, error: { kind: 'setup', message: 'Finans için mevcut Supabase bağlantısı ve yönetici oturumu gerekli.' } })
      return false
    }
    const sequence = Symbol('finance-load')
    loadSequence.current = sequence
    publish({ loading: true, error: null })
    try {
      const row = await repository.load(ownerId)
      if (!mounted.current || sequence !== loadSequence.current) return false
      publish({ data: row.state, revision: row.revision, updatedAt: row.updated_at, loading: false, error: null })
      return true
    } catch (error) { if (mounted.current && sequence === loadSequence.current) publish({ loading: false, error: financeError(error) }); return false }
  }, [ownerId, publish])

  useEffect(() => {
    mounted.current = true
    if (!demoAllowed) void reload()
    return () => { mounted.current = false; loadSequence.current = null }
  }, [reload])

  useEffect(() => {
    const warn = event => { if (busy.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const update = async updater => {
    if (busy.current || current.current.loading || !demoAllowed && current.current.revision === undefined) return false
    busy.current = true
    publish({ saving: true, error: null })
    try {
      const previous = current.current.data
      const draft = typeof updater === 'function' ? updater(previous) : updater
      const next = draft.investments !== previous.investments && draft.investmentHistory === previous.investmentHistory
        ? { ...draft, investmentHistory: upsertInvestmentSnapshot(draft.investmentHistory, investmentSnapshot(draft.investments)) }
        : draft
      if (demoAllowed) {
        localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(next))
        publish({ data: next, saving: false })
      } else {
        const row = await repository.save(ownerId, next, current.current.revision, crypto.randomUUID())
        if (!mounted.current) return false
        publish({ data: row.state, revision: row.revision, updatedAt: row.updated_at, saving: false })
      }
      return true
    } catch (error) { if (mounted.current) publish({ saving: false, error: demoAllowed ? { kind: 'storage', message: 'Tarayıcı depolaması kullanılamadı. Kayıt tamamlanmadı.' } : financeError(error) }); return false }
    finally { busy.current = false }
  }

  return { ...snapshot, update, reload, demo: demoAllowed, ready: demoAllowed || snapshot.revision !== undefined }
}
