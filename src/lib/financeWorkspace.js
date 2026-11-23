import { accounts, categories } from './financeDemo.js'

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const numeric = (value, min = 0, max = 1e24) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
const text = (value, max = 240) => typeof value === 'string' && value.trim().length > 0 && value.length <= max
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number(value.slice(0, 4)) >= 1900 && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value

export function createEmptyFinance() {
  return {
    version: 1,
    accounts: accounts.map(account => ({ ...account, institution: account.id === 'daily' ? 'Kuveyt Türk · TRY' : account.institution, suffix: null, opening: 0, openingDate: null })),
    transactions: [], budgets: Object.fromEntries(categories.filter(category => category.id !== 'income').map(category => [category.id, 0])),
    goals: [], bills: [], investments: [], investmentHistory: [], statementImports: [], realizedInvestmentGain: 0
  }
}

export function validateFinanceWorkspace(state) {
  const invalid = () => { throw Object.assign(new Error('Finans verisi beklenen biçimde değil. Kayıt değiştirilmedi.'), { code: '22023' }) }
  if (!object(state) || state.version !== 1 || !object(state.budgets) || !numeric(state.realizedInvestmentGain, -1e24)) invalid()
  for (const key of ['accounts', 'transactions', 'goals', 'bills', 'investments', 'investmentHistory', 'statementImports']) {
    if (!Array.isArray(state[key]) || state[key].length > 50000 || state[key].some(entry => !object(entry))) invalid()
    const idKey = key === 'investmentHistory' ? 'date' : 'id'
    if (state[key].some(entry => !text(entry[idKey])) || new Set(state[key].map(entry => entry[idKey])).size !== state[key].length) invalid()
  }
  if (state.accounts.length !== 3 || !['daily', 'savings', 'cash'].every(id => state.accounts.some(account => account.id === id))) invalid()
  if (state.accounts.some(account => !text(account.name, 80) || !text(account.institution, 100) || !numeric(account.opening, -1e12, 1e12) || account.openingDate !== null && !date(account.openingDate))) invalid()
  const accountIds = new Set(state.accounts.map(account => account.id)), categoryIds = new Set(categories.map(category => category.id))
  if (Object.keys(state.budgets).length !== 6 || categories.filter(category => category.id !== 'income').some(category => !numeric(state.budgets[category.id], 0, 1e12))) invalid()
  if (state.transactions.some(transaction => !text(transaction.title) || !date(transaction.date) || !numeric(transaction.amount, 0.01, 1e12) || !['income', 'expense'].includes(transaction.type) || !accountIds.has(transaction.account) || !categoryIds.has(transaction.category) || (transaction.type === 'income') !== (transaction.category === 'income'))) invalid()
  if (state.goals.some(goal => !text(goal.name, 80) || !numeric(goal.target, 0.00000001, 1e12) || !numeric(goal.saved, 0, 1e12) || goal.deadline && !/^\d{4}-(0[1-9]|1[0-2])$/.test(goal.deadline))) invalid()
  if (state.investments.some(position => !['bist', 'gold-gram', 'gold-quarter', 'gold-other'].includes(position.kind) || !text(position.symbol, 16) || !text(position.name, 80) || !numeric(position.quantity, 0.00000001, 1e12) || !numeric(position.averageCost, 0.00000001, 1e12) || !numeric(position.price, 0.00000001, 1e12) || !date(position.priceDate))) invalid()
  if (state.bills.some(bill => !text(bill.name, 80) || !numeric(bill.amount, 0.01, 1e12) || !date(bill.date) || !categoryIds.has(bill.category) || typeof bill.paid !== 'boolean')) invalid()
  if (state.investmentHistory.some(entry => !date(entry.date) || !['bist', 'gold'].every(group => object(entry.groups?.[group]) && numeric(entry.groups[group].cost) && numeric(entry.groups[group].value)))) invalid()
  if (state.statementImports.some(batch => !text(batch.hash, 64) || !/^[a-f0-9]{64}$/.test(batch.hash) || !Number.isInteger(batch.count) || batch.count < 0 || !Number.isFinite(Date.parse(batch.createdAt)))) invalid()
  return state
}

export function financeError(error) {
  const code = error?.code
  if (['42P01', 'PGRST202', 'PGRST205', 'FINANCE_SETUP'].includes(code)) return { kind: 'setup', message: 'Supabase finans kurulumu henüz tamamlanmamış. Hazırlanan SQL dosyasını mevcut portfolyo projenizde çalıştırın.' }
  if (code === 'FINANCE_OWNER') return { kind: 'owner', message: 'Bu oturum için finans alanı bulunamadı. SQL kurulumundaki e-posta ile giriş hesabınızın aynı olduğunu kontrol edin.' }
  if (code === '40001') return { kind: 'conflict', message: 'Finans kayıtları başka bir sekmede veya cihazda değişti. Güncel sunucu kaydını yükleyip işlemi yeniden kontrol edin.' }
  if (['42501', 'PGRST301', 'PGRST302', '401', '403'].includes(String(code))) return { kind: 'auth', message: 'Finans verisine erişilemedi. Yönetici hesabınızla yeniden giriş yapın.' }
  if (['22023', '23514'].includes(code)) return { kind: 'validation', message: 'Kayıt sunucu doğrulamasından geçemedi. Tarih ve tutarları kontrol edin.' }
  return { kind: 'connection', message: 'Supabase yanıtı doğrulanamadı. Değişiklik kaydedildi olarak işaretlenmedi; formunuz korunuyor. Bağlantıyı kontrol edin veya sunucu kaydını yeniden yükleyin.' }
}

export function createFinanceRepository(client) {
  const readRow = async ownerId => {
    const { data, error } = await client.from('finance_workspace').select('owner_id,state,revision,updated_at,last_mutation_id').eq('owner_id', ownerId).maybeSingle()
    if (error) throw error
    if (!data) throw Object.assign(new Error('Finance owner not configured'), { code: 'FINANCE_OWNER' })
    if (data.owner_id !== ownerId || !Number.isSafeInteger(Number(data.revision)) || Number(data.revision) < 0) throw new Error('Invalid finance response')
    validateFinanceWorkspace(data.state)
    return { ...data, revision: Number(data.revision) }
  }
  return {
    load: readRow,
    async save(ownerId, state, revision, mutationId) {
      validateFinanceWorkspace(state)
      let response
      try {
        response = await client.rpc('finance_save_workspace', { p_state: state, p_expected_revision: revision, p_mutation_id: mutationId })
      } catch (error) { response = { error } }
      if (response.error) {
        // A dropped HTTP response may hide a successful commit. Reconcile before reporting failure.
        try {
          const latest = await readRow(ownerId)
          if (latest.last_mutation_id === mutationId) return latest
        } catch { /* Never substitute cached/browser data for an unverified server response. */ }
        throw response.error
      }
      const row = Array.isArray(response.data) ? response.data[0] : response.data
      if (!row || row.owner_id !== ownerId || Number(row.revision) !== revision + 1 || row.last_mutation_id !== mutationId) throw new Error('Invalid finance save acknowledgement')
      validateFinanceWorkspace(row.state)
      return { ...row, revision: Number(row.revision) }
    }
  }
}
