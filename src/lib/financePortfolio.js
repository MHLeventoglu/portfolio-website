const round = value => Math.round((value + Number.EPSILON) * 1e8) / 1e8
const amount = (value, label, allowZero = false) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || (allowZero ? parsed < 0 : parsed <= 0) || parsed > 1e12) throw new Error(`${label} ${allowZero ? 'sıfır veya pozitif' : 'pozitif'} bir sayı olmalı.`)
  return parsed
}

export const investmentTypes = [
  { id: 'bist', label: 'BIST hissesi', unit: 'lot', color: 'var(--fin-lilac)' },
  { id: 'gold-gram', label: 'Gram altın · 24 ayar', unit: 'gram', color: 'var(--fin-gold)' },
  { id: 'gold-quarter', label: 'Çeyrek altın', unit: 'adet', color: 'var(--fin-gold)' },
  { id: 'gold-other', label: 'Diğer altın', unit: 'adet', color: 'var(--fin-gold)' }
]

export function createInvestmentDemo() {
  return [
    { id: 'thy-demo', kind: 'bist', symbol: 'THYAO', name: 'Türk Hava Yolları', quantity: 120, averageCost: 265, price: 298.5, priceDate: '2026-11-15', source: 'demo' },
    { id: 'asels-demo', kind: 'bist', symbol: 'ASELS', name: 'Aselsan', quantity: 200, averageCost: 71.5, price: 83.2, priceDate: '2026-11-15', source: 'demo' },
    { id: 'tuprs-demo', kind: 'bist', symbol: 'TUPRS', name: 'Tüpraş', quantity: 80, averageCost: 168, price: 157.4, priceDate: '2026-11-15', source: 'demo' },
    { id: 'gold-demo', kind: 'gold-gram', symbol: 'GRAM', name: 'Gram altın', quantity: 18.5, averageCost: 3700, price: 4120, priceDate: '2026-11-15', source: 'demo' }
  ]
}

export function migrateFinanceData(saved, fallback) {
  if (!Array.isArray(saved?.transactions) || !saved.budgets || !Array.isArray(saved.goals) || !Array.isArray(saved.bills)) return fallback
  const legacyDeadlines = { emergency: '2027-03', travel: '2027-06', studio: '2027-04' }
  const investments = Array.isArray(saved.investments) ? saved.investments : createInvestmentDemo()
  return { ...saved, goals: saved.goals.map(goal => ({ ...goal, deadline: goal.deadline ?? legacyDeadlines[goal.id] ?? '' })), investments, investmentHistory: Array.isArray(saved.investmentHistory) ? saved.investmentHistory : initialInvestmentHistory(investments) }
}

export function validateGoal(values) {
  const name = String(values.name || '').trim()
  if (!name || name.length > 80) throw new Error('Hedef adı 1–80 karakter olmalı.')
  const deadline = String(values.deadline || '')
  if (deadline && !/^\d{4}-(0[1-9]|1[0-2])$/.test(deadline)) throw new Error('Geçerli bir hedef tarihi seçin.')
  return { name, target: amount(values.target, 'Hedef tutarı'), saved: amount(values.saved, 'Mevcut birikim', true), deadline, icon: ['shield', 'travel', 'studio'].includes(values.icon) ? values.icon : 'shield', color: ['teal', 'lilac', 'peach'].includes(values.color) ? values.color : 'teal' }
}

export function adjustGoal(goal, value, direction) {
  const change = amount(value, 'Tutar')
  if (!['add', 'withdraw'].includes(direction)) throw new Error('Geçersiz birikim işlemi.')
  if (direction === 'withdraw' && change > goal.saved) throw new Error('Çıkarılan tutar mevcut birikimi aşamaz.')
  return { ...goal, saved: round(goal.saved + (direction === 'withdraw' ? -change : change)) }
}

export function validateInvestment(values) {
  const kind = investmentTypes.find(type => type.id === values.kind)
  if (!kind) throw new Error('Geçerli bir varlık türü seçin.')
  const symbol = String(values.symbol || '').trim().toLocaleUpperCase('en-US')
  const name = String(values.name || '').trim()
  if (!name || name.length > 80) throw new Error('Varlık adı 1–80 karakter olmalı.')
  if (!symbol || symbol.length > 16 || !/^[A-Z0-9.-]+$/.test(symbol)) throw new Error('Kod yalnızca harf, sayı, nokta veya tire içermeli (en fazla 16 karakter).')
  const priceDate = String(values.priceDate || '')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(priceDate) || !Number.isFinite(Date.parse(`${priceDate}T12:00:00`)) || new Date(`${priceDate}T12:00:00Z`).toISOString().slice(0, 10) !== priceDate) throw new Error('Geçerli bir fiyat tarihi seçin.')
  return { kind: kind.id, symbol, name, quantity: amount(values.quantity, 'Miktar'), averageCost: amount(values.averageCost, 'Ortalama alış maliyeti'), price: amount(values.price, 'Son fiyat'), priceDate }
}

export function investmentMetrics(position) {
  const cost = position.quantity * position.averageCost, value = position.quantity * position.price
  return { cost, value, gain: value - cost, rate: cost ? (value - cost) / cost * 100 : 0 }
}

export function investmentSummary(positions) {
  const totals = positions.reduce((sum, position) => { const metrics = investmentMetrics(position); return { cost: sum.cost + metrics.cost, value: sum.value + metrics.value } }, { cost: 0, value: 0 })
  return { ...totals, gain: totals.value - totals.cost, rate: totals.cost ? (totals.value - totals.cost) / totals.cost * 100 : 0 }
}

export function tradeInvestment(position, values) {
  const quantity = amount(values.quantity, 'Miktar'), price = amount(values.price, 'Birim fiyat')
  if (!['buy', 'sell'].includes(values.direction)) throw new Error('Geçersiz yatırım işlemi.')
  if (values.direction === 'sell' && quantity > position.quantity) throw new Error('Satış miktarı mevcut miktarı aşamaz.')
  const newQuantity = round(position.quantity + (values.direction === 'sell' ? -quantity : quantity))
  return {
    position: { ...position, quantity: newQuantity, averageCost: values.direction === 'buy' ? round((position.quantity * position.averageCost + quantity * price) / newQuantity) : position.averageCost },
    realizedGain: values.direction === 'sell' ? round((price - position.averageCost) * quantity) : 0
  }
}

export function updateInvestmentPrices(positions, prices, priceDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(priceDate) || !Number.isFinite(Date.parse(`${priceDate}T12:00:00`)) || new Date(`${priceDate}T12:00:00Z`).toISOString().slice(0, 10) !== priceDate) throw new Error('Geçerli bir fiyat tarihi seçin.')
  return positions.map(position => prices[position.id] === undefined ? position : { ...position, price: amount(prices[position.id], `${position.symbol} fiyatı`), priceDate, source: 'manual' })
}

export const todayInIstanbul = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

const validDate = date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(`${date}T12:00:00Z`)) && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date

export function investmentSnapshot(positions, date = todayInIstanbul()) {
  if (!validDate(date)) throw new Error('Geçerli bir kayıt tarihi seçin.')
  const summarizeGroup = group => {
    const { cost, value } = investmentSummary(positions.filter(position => group === 'bist' ? position.kind === 'bist' : position.kind !== 'bist'))
    return { cost: round(cost), value: round(value) }
  }
  return { date, source: positions.some(position => position.source === 'demo') ? 'demo' : 'recorded', groups: { bist: summarizeGroup('bist'), gold: summarizeGroup('gold') } }
}

export function createInvestmentHistoryDemo() {
  // Illustrative valuations, never presented as historical market quotes.
  const prices = [
    ['2026-06-15', 252, 66, 152, 3270], ['2026-07-15', 268, 69, 159, 3440],
    ['2026-08-15', 259, 76, 164, 3610], ['2026-09-15', 282, 73, 161, 3840],
    ['2026-10-15', 291, 79, 166, 3990], ['2026-11-15', 298.5, 83.2, 157.4, 4120]
  ]
  return prices.map(([date, ...values]) => investmentSnapshot(createInvestmentDemo().map((position, i) => ({ ...position, price: values[i] })), date))
}

export function initialInvestmentHistory(positions, date = todayInIstanbul()) {
  const demo = createInvestmentDemo()
  const untouchedDemo = positions.length === demo.length && demo.every(expected => positions.some(position => ['id', 'kind', 'quantity', 'averageCost', 'price', 'source'].every(key => position[key] === expected[key])))
  if (untouchedDemo) return createInvestmentHistoryDemo()
  return positions.length ? [investmentSnapshot(positions, date)] : []
}

export function validateInvestmentHistory(values) {
  if (!validDate(values.date) || values.date > todayInIstanbul()) throw new Error('Bugünden ileri olmayan geçerli bir tarih seçin.')
  return { date: values.date, source: 'manual', groups: {
    bist: { cost: amount(values.bistCost, 'BIST maliyeti', true), value: amount(values.bistValue, 'BIST değeri', true) },
    gold: { cost: amount(values.goldCost, 'Altın maliyeti', true), value: amount(values.goldValue, 'Altın değeri', true) }
  } }
}

export function upsertInvestmentSnapshot(history, snapshot) {
  return [...history.filter(entry => entry.date !== snapshot.date), snapshot].sort((a, b) => a.date.localeCompare(b.date))
}

export function investmentHistorySeries(history, group = 'all', period = 'all') {
  const sorted = history.filter(entry => validDate(entry.date) && ['bist', 'gold'].every(key => Number.isFinite(entry.groups?.[key]?.cost) && entry.groups[key].cost >= 0 && Number.isFinite(entry.groups[key].value) && entry.groups[key].value >= 0)).sort((a, b) => a.date.localeCompare(b.date))
  let cutoff = ''
  if (sorted.length && ['1', '3', '6'].includes(String(period))) {
    const last = new Date(`${sorted.at(-1).date}T12:00:00Z`), day = last.getUTCDate()
    last.setUTCDate(1); last.setUTCMonth(last.getUTCMonth() - Number(period))
    const daysInMonth = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + 1, 0)).getUTCDate()
    last.setUTCDate(Math.min(day, daysInMonth))
    cutoff = last.toISOString().slice(0, 10)
  }
  return sorted.filter(entry => entry.date >= cutoff).map(entry => {
    const groups = group === 'bist' || group === 'gold' ? [entry.groups[group]] : [entry.groups.bist, entry.groups.gold]
    return { ...entry, cost: round(groups.reduce((sum, item) => sum + item.cost, 0)), value: round(groups.reduce((sum, item) => sum + item.value, 0)) }
  })
}
