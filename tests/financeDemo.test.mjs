import test from 'node:test'
import assert from 'node:assert/strict'
import { accounts, months, DEMO_MONTH, createFinanceDemo, filterTransactions, summarize, categoryTotals, accountBalance, transactionCSV } from '../src/lib/financeDemo.js'

test('demo balances reconcile with income, expenses and category totals in every period', () => {
  const data = createFinanceDemo()
  assert.equal(data.transactions.length, 132)
  for (const month of months) {
    const transactions = filterTransactions(data.transactions, { month })
    const totals = summarize(transactions)
    assert.equal(totals.expense, categoryTotals(transactions).reduce((sum, c) => sum + c.amount, 0))
    assert.equal(totals.net, totals.income - totals.expense)
    const cumulative = summarize(data.transactions.filter(t => t.date.slice(0, 7) <= month))
    assert.equal(accounts.reduce((sum, a) => sum + accountBalance(a, data.transactions, month), 0), accounts.reduce((sum, a) => sum + a.opening, 0) + cumulative.net)
    assert.ok(accounts.every(a => accountBalance(a, data.transactions, month) >= 0))
  }
  assert.deepEqual(summarize(filterTransactions(data.transactions, { month: DEMO_MONTH })), { income: 74500, expense: 31915, net: 42585, rate: 42585 / 74500 * 100 })
})

test('transaction filters combine Turkish search, period, type, category and account without mutation', () => {
  const data = createFinanceDemo(), original = [...data.transactions]
  const filtered = filterTransactions(data.transactions, { month: DEMO_MONTH, query: 'İSTANBUL', type: 'expense', category: 'transport', account: 'daily' })
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].title, 'İstanbulkart')
  assert.equal(filterTransactions(data.transactions, { month: DEMO_MONTH, type: 'income', category: 'food' }).length, 0)
  assert.deepEqual(data.transactions, original)
  const sorted = filterTransactions(data.transactions, { month: DEMO_MONTH })
  assert.ok(sorted.every((t, i) => !i || sorted[i - 1].date >= t.date))
})

test('new expenses update current account and month while preserving past periods', () => {
  const data = createFinanceDemo(), daily = accounts.find(a => a.id === 'daily')
  const transaction = { id: 'new', title: 'Test', amount: 125.5, type: 'expense', category: 'food', account: 'daily', date: '2026-11-15' }
  const updated = [...data.transactions, transaction]
  assert.equal(accountBalance(daily, updated, DEMO_MONTH), accountBalance(daily, data.transactions, DEMO_MONTH) - 125.5)
  assert.equal(accountBalance(daily, updated, '2026-10'), accountBalance(daily, data.transactions, '2026-10'))
  assert.equal(summarize(filterTransactions(updated, { month: DEMO_MONTH })).expense, 32040.5)
  assert.deepEqual(summarize([]), { income: 0, expense: 0, net: 0, rate: 0 })
})

test('CSV preserves Turkish text, signed decimal amounts and quoted descriptions', () => {
  const csv = transactionCSV([{ id: 'csv', title: 'Kitap; "özel"', amount: 125.5, type: 'expense', category: 'shopping', account: 'daily', date: '2026-11-15' }])
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"Kitap; ""özel"""'))
  assert.ok(csv.includes('"-125,50"'))
  assert.ok(csv.includes('"Alışveriş";"Günlük hesap"'))
})

test('opening date prevents counting earlier statement transactions twice', () => {
  const account = { id: 'daily', opening: 1000, openingDate: '2026-11-01' }
  const transactions = [
    { account: 'daily', date: '2026-10-31', type: 'income', amount: 9000 },
    { account: 'daily', date: '2026-11-01', type: 'expense', amount: 125.5 },
    { account: 'daily', date: '2026-12-01', type: 'income', amount: 100 }
  ]
  assert.equal(accountBalance(account, transactions, '2026-10'), 0)
  assert.equal(accountBalance(account, transactions, '2026-11'), 874.5)
  assert.equal(accountBalance(account, transactions, '2026-12'), 974.5)
})

test('CSV uses personal account labels and neutralizes description formulas', () => {
  const csv = transactionCSV([{ date: '2026-11-21', title: '=1+1', type: 'expense', category: 'food', account: 'daily', amount: 12.5 }], [{ id: 'daily', name: 'Kuveyt Türk TL' }])
  assert.ok(csv.includes('Kuveyt Türk TL'))
  assert.ok(csv.includes("'=1+1"))
  assert.ok(csv.includes('-12,50'))
})
