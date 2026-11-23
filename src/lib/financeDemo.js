import { createInvestmentDemo, createInvestmentHistoryDemo } from './financePortfolio.js'

export const DEMO_MONTH = '2026-11'
export const FINANCE_STORAGE_KEY = 'mhl-finance-demo-v1'
export const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', DEMO_MONTH]

export const categories = [
  { id: 'home', label: 'Ev & yaşam', color: '#75b9bc', budget: 18000, icon: 'home' },
  { id: 'food', label: 'Yeme & içme', color: '#9aa9e1', budget: 5000, icon: 'food' },
  { id: 'shopping', label: 'Alışveriş', color: '#c49bb4', budget: 5000, icon: 'shopping' },
  { id: 'transport', label: 'Ulaşım', color: '#b8bf8e', budget: 3000, icon: 'transport' },
  { id: 'fun', label: 'Kültür & eğlence', color: '#dcaa82', budget: 2500, icon: 'fun' },
  { id: 'health', label: 'Sağlık', color: '#89b2d9', budget: 2000, icon: 'health' },
  { id: 'income', label: 'Gelir', color: '#75b9bc', icon: 'income' }
]

export const accounts = [
  { id: 'daily', name: 'Günlük hesap', institution: 'Vadesiz · TRY', suffix: '4826', opening: 18500, color: 'teal' },
  { id: 'savings', name: 'Birikim hesabı', institution: 'Birikim · TRY', suffix: '0914', opening: 96000, color: 'lilac' },
  { id: 'cash', name: 'Nakit', institution: 'Cüzdan · TRY', suffix: null, opening: 12500, color: 'peach' }
]

const templates = [
  ['Maaş', 'income', 62000, 1, 'daily', 'income'],
  ['Ev kirası', 'home', 14500, 2, 'daily', 'expense'],
  ['Market alışverişi', 'food', 1840, 3, 'daily', 'expense'],
  ['İstanbulkart', 'transport', 980, 3, 'daily', 'expense'],
  ['Elektrik faturası', 'home', 680, 4, 'daily', 'expense'],
  ['Kahve', 'food', 185, 4, 'cash', 'expense'],
  ['Kitap alışverişi', 'shopping', 760, 5, 'daily', 'expense'],
  ['İnternet', 'home', 520, 5, 'daily', 'expense'],
  ['Akşam yemeği', 'food', 1240, 6, 'daily', 'expense'],
  ['Serbest çalışma', 'income', 12500, 7, 'savings', 'income'],
  ['Spor salonu', 'health', 1250, 7, 'daily', 'expense'],
  ['Market alışverişi', 'food', 1620, 8, 'daily', 'expense'],
  ['Sinema', 'fun', 650, 9, 'cash', 'expense'],
  ['Tasarım aboneliği', 'fun', 450, 10, 'daily', 'expense'],
  ['Giyim', 'shopping', 2180, 10, 'daily', 'expense'],
  ['Taksi', 'transport', 480, 11, 'daily', 'expense'],
  ['Eczane', 'health', 380, 11, 'cash', 'expense'],
  ['Öğle yemeği', 'food', 420, 12, 'daily', 'expense'],
  ['Konser bileti', 'fun', 1400, 13, 'daily', 'expense'],
  ['Ev alışverişi', 'shopping', 970, 14, 'daily', 'expense'],
  ['Kahve', 'food', 210, 15, 'cash', 'expense'],
  ['Akaryakıt', 'transport', 1200, 15, 'daily', 'expense']
]

export function createFinanceDemo() {
  const transactions = months.flatMap((month, index) => templates.map(([title, category, amount, day, account, type], i) => ({
    id: `demo-${month}-${i}`, title, category, account, type,
    amount: index === 5 || category === 'home' ? amount : Math.round(amount * [0.84, 0.92, 1.08, 0.95, 1.04][index] / 10) * 10,
    date: `${month}-${String(day).padStart(2, '0')}`, note: ''
  })))
  return {
    transactions,
    budgets: Object.fromEntries(categories.filter(c => c.budget).map(c => [c.id, c.budget])),
    goals: [
      { id: 'emergency', name: 'Acil durum fonu', saved: 72000, target: 100000, deadline: '2027-03', icon: 'shield', color: 'teal' },
      { id: 'travel', name: 'Japonya seyahati', saved: 28500, target: 75000, deadline: '2027-06', icon: 'travel', color: 'lilac' },
      { id: 'studio', name: 'Çalışma alanı', saved: 18000, target: 45000, deadline: '2027-04', icon: 'studio', color: 'peach' }
    ],
    investments: createInvestmentDemo(),
    investmentHistory: createInvestmentHistoryDemo(),
    bills: [
      { id: 'phone', name: 'Telefon', amount: 480, date: '2026-11-18', category: 'home', paid: false },
      { id: 'music', name: 'Müzik aboneliği', amount: 100, date: '2026-11-20', category: 'fun', paid: false },
      { id: 'water', name: 'Su faturası', amount: 340, date: '2026-11-23', category: 'home', paid: false }
    ]
  }
}

export function filterTransactions(transactions, { month, query = '', type = 'all', category = 'all', account = 'all' } = {}) {
  const normalized = query.toLocaleLowerCase('tr').trim()
  return transactions.filter(t => (!month || t.date.startsWith(month)) &&
    (type === 'all' || t.type === type) && (category === 'all' || t.category === category) &&
    (account === 'all' || t.account === account) &&
    (!normalized || `${t.title} ${t.note || ''}`.toLocaleLowerCase('tr').includes(normalized)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

export function summarize(transactions) {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  return { income, expense, net: income - expense, rate: income ? (income - expense) / income * 100 : 0 }
}

export function categoryTotals(transactions) {
  return categories.filter(c => c.id !== 'income').map(category => ({ ...category,
    amount: transactions.filter(t => t.type === 'expense' && t.category === category.id).reduce((sum, t) => sum + t.amount, 0)
  }))
}

export function accountBalance(account, transactions, month) {
  if (month && account.openingDate && month < account.openingDate.slice(0, 7)) return 0
  const summary = summarize(transactions.filter(t => t.account === account.id && (!account.openingDate || t.date >= account.openingDate) && (!month || t.date.slice(0, 7) <= month)))
  return account.opening + summary.net
}

export const money = (value, decimals = 0) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value)
export const monthLabel = (month, short = false) => new Date(`${month}-01T12:00:00`).toLocaleDateString('tr-TR', { month: short ? 'short' : 'long', ...(short ? {} : { year: 'numeric' }) })
export const dateLabel = date => new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

export function transactionCSV(transactions, accountList = accounts) {
  const escape = value => `"${String(value).replaceAll('"', '""')}"`
  return '\uFEFF' + [['Tarih', 'Açıklama', 'Tür', 'Kategori', 'Hesap', 'Tutar (TRY)'], ...transactions.map(t => [t.date, /^[\s]*[=+@-]/.test(t.title) ? `'${t.title}` : t.title, t.type === 'income' ? 'Gelir' : 'Gider', categories.find(c => c.id === t.category)?.label || t.category, accountList.find(a => a.id === t.account)?.name || t.account, (t.type === 'income' ? t.amount : -t.amount).toFixed(2).replace('.', ',')])].map(row => row.map(escape).join(';')).join('\r\n')
}
