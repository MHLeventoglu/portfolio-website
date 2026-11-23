import test from 'node:test'
import assert from 'node:assert/strict'
import { createFinanceDemo } from '../src/lib/financeDemo.js'
import { createInvestmentDemo, migrateFinanceData, validateGoal, adjustGoal, validateInvestment, investmentMetrics, investmentSummary, tradeInvestment, updateInvestmentPrices, createInvestmentHistoryDemo, investmentSnapshot, initialInvestmentHistory, validateInvestmentHistory, upsertInvestmentSnapshot, investmentHistorySeries } from '../src/lib/financePortfolio.js'

test('old browser data retains edited goals and transactions while new investment fields are added', () => {
  const old = createFinanceDemo()
  delete old.investments
  old.goals[0] = { id: 'emergency', name: 'Değiştirilmiş hedef', saved: 123.5, target: 200, date: 'Mart 2027' }
  const migrated = migrateFinanceData(old, createFinanceDemo())
  assert.equal(migrated.goals[0].name, 'Değiştirilmiş hedef')
  assert.equal(migrated.goals[0].saved, 123.5)
  assert.equal(migrated.goals[0].deadline, '2027-03')
  assert.deepEqual(migrated.transactions, old.transactions)
  assert.equal(migrated.investments.length, 4)
  assert.equal(old.goals[0].deadline, undefined)
  const empty = migrateFinanceData({ ...old, goals: [], investments: [], realizedInvestmentGain: -25 }, createFinanceDemo())
  assert.deepEqual(empty.goals, [])
  assert.deepEqual(empty.investments, [])
  assert.equal(empty.realizedInvestmentGain, -25)
  assert.equal(migrateFinanceData(null, old), old)
})

test('goal forms validate amounts and allow completed goals without losing precision', () => {
  const goal = validateGoal({ name: ' Bilgisayar ', saved: 100.1, target: 100, deadline: '2027-06', icon: 'studio', color: 'lilac' })
  assert.equal(goal.name, 'Bilgisayar')
  assert.equal(adjustGoal(goal, 0.2, 'add').saved, 100.3)
  assert.equal(adjustGoal(goal, 100.1, 'withdraw').saved, 0)
  assert.equal(goal.saved, 100.1)
  for (const invalid of [0, -1, NaN, Infinity, 'invalid']) assert.throws(() => adjustGoal(goal, invalid, 'add'))
  assert.throws(() => adjustGoal(goal, 101, 'withdraw'), /aşamaz/)
  assert.throws(() => adjustGoal(goal, 1, 'invalid'))
  assert.throws(() => validateGoal({ name: ' ', saved: 0, target: 10 }))
  assert.throws(() => validateGoal({ name: 'Test', saved: -1, target: 10 }))
  assert.throws(() => validateGoal({ name: 'Test', saved: 0, target: 0 }))
  assert.throws(() => validateGoal({ name: 'Test', saved: 0, target: 10, deadline: '2027-13' }))
})

test('BIST and gold valuation reconciles cost, value, gains and empty portfolios', () => {
  const positions = createInvestmentDemo(), totals = investmentSummary(positions)
  assert.equal(totals.value, 141272)
  assert.equal(totals.cost, 127990)
  assert.equal(totals.gain, 13282)
  assert.equal(totals.rate, totals.gain / totals.cost * 100)
  const gold = investmentMetrics(positions.find(p => p.kind === 'gold-gram'))
  assert.equal(gold.cost, 68450)
  assert.equal(gold.value, 76220)
  assert.equal(gold.gain, 7770)
  assert.ok(investmentMetrics(positions.find(p => p.symbol === 'TUPRS')).gain < 0)
  assert.deepEqual(investmentSummary([]), { cost: 0, value: 0, gain: 0, rate: 0 })
})

test('manual prices preserve quantity and cost, mark provenance and validate all entries before saving', () => {
  const positions = createInvestmentDemo()
  const updated = updateInvestmentPrices(positions, { 'gold-demo': 4000, 'thy-demo': 300 }, '2026-11-16')
  assert.equal(updated.find(p => p.id === 'gold-demo').price, 4000)
  assert.equal(updated.find(p => p.id === 'gold-demo').source, 'manual')
  assert.equal(updated.find(p => p.id === 'gold-demo').priceDate, '2026-11-16')
  assert.equal(updated.find(p => p.id === 'gold-demo').quantity, 18.5)
  assert.equal(updated.find(p => p.id === 'gold-demo').averageCost, 3700)
  assert.equal(updated.find(p => p.id === 'asels-demo').source, 'demo')
  assert.equal(positions.find(p => p.id === 'gold-demo').price, 4120)
  assert.throws(() => updateInvestmentPrices(positions, { 'gold-demo': -10 }, '2026-11-16'))
  assert.throws(() => updateInvestmentPrices(positions, {}, '2026-02-30'))
})

test('buys use weighted cost and sales preserve average cost while calculating realized profit', () => {
  const position = { id: 'test', quantity: 10, averageCost: 100, price: 150 }
  const buy = tradeInvestment(position, { direction: 'buy', quantity: 5, price: 160 })
  assert.equal(buy.position.quantity, 15)
  assert.equal(buy.position.averageCost, 120)
  assert.equal(buy.position.price, 150)
  assert.equal(buy.realizedGain, 0)
  const sale = tradeInvestment(buy.position, { direction: 'sell', quantity: 6, price: 170 })
  assert.equal(sale.position.quantity, 9)
  assert.equal(sale.position.averageCost, 120)
  assert.equal(sale.realizedGain, 300)
  assert.equal(tradeInvestment(sale.position, { direction: 'sell', quantity: 9, price: 110 }).position.quantity, 0)
  assert.equal(tradeInvestment(sale.position, { direction: 'sell', quantity: 9, price: 110 }).realizedGain, -90)
  assert.throws(() => tradeInvestment(position, { direction: 'sell', quantity: 11, price: 150 }), /aşamaz/)
  assert.throws(() => tradeInvestment(position, { direction: 'buy', quantity: 1, price: Infinity }))
  assert.equal(position.quantity, 10)
})

test('asset form validates symbol, units, fractional amounts and real calendar dates', () => {
  const values = { kind: 'bist', symbol: 'thyao', name: ' Türk Hava Yolları ', quantity: '0.5', averageCost: '265.25', price: '280.5', priceDate: '2026-11-15' }
  const result = validateInvestment(values)
  assert.equal(result.symbol, 'THYAO')
  assert.equal(result.name, 'Türk Hava Yolları')
  assert.equal(result.quantity, 0.5)
  assert.throws(() => validateInvestment({ ...values, priceDate: '2026-02-30' }))
  assert.throws(() => validateInvestment({ ...values, quantity: -1 }))
  assert.throws(() => validateInvestment({ ...values, kind: 'unknown' }))
  assert.throws(() => validateInvestment({ ...values, symbol: 'BAD SYMBOL' }))
})

test('history demo ends at current demo valuation and does not invent a past for customized holdings', () => {
  const demo = createInvestmentDemo(), history = createInvestmentHistoryDemo()
  assert.equal(history.length, 6)
  assert.ok(history.every(point => point.source === 'demo'))
  assert.equal(investmentHistorySeries(history).at(-1).value, investmentSummary(demo).value)
  assert.equal(investmentHistorySeries(history).at(-1).cost, investmentSummary(demo).cost)
  assert.equal(initialInvestmentHistory(demo).length, 6)
  const customized = [{ ...demo[0], quantity: 2, source: 'manual' }]
  const initial = initialInvestmentHistory(customized, '2026-11-15')
  assert.equal(initial.length, 1)
  assert.equal(initial[0].source, 'recorded')
  assert.equal(investmentHistorySeries(initial)[0].value, 597)
  assert.deepEqual(initialInvestmentHistory([]), [])
})

test('new daily snapshots preserve historical quantities and replace only the same day', () => {
  const positions = createInvestmentDemo()
  const first = investmentSnapshot(positions, '2026-10-15')
  const sold = positions.filter(p => p.id !== 'thy-demo')
  const next = investmentSnapshot(sold, '2026-11-15')
  const history = upsertInvestmentSnapshot([first], next)
  assert.equal(history.length, 2)
  assert.equal(history[0].groups.bist.value, 65052)
  assert.equal(history[1].groups.bist.value, 29232)
  const repriced = investmentSnapshot(sold.map(p => ({ ...p, price: 100 })), '2026-11-15')
  const replaced = upsertInvestmentSnapshot(history, repriced)
  assert.equal(replaced.length, 2)
  assert.deepEqual(replaced[0], first)
  assert.equal(replaced[1].groups.bist.value, 28000)
  assert.equal(history[1].groups.bist.value, 29232)
  assert.throws(() => investmentSnapshot([], '2026-02-30'))
  assert.equal(investmentHistorySeries([investmentSnapshot([], '2026-11-15')])[0].value, 0)
})

test('history period filters use dates, clamp month ends and split BIST and gold consistently', () => {
  const history = createInvestmentHistoryDemo()
  assert.deepEqual(investmentHistorySeries(history, 'all', '1').map(p => p.date), ['2026-10-15', '2026-11-15'])
  assert.equal(investmentHistorySeries(history, 'all', '3').length, 4)
  const total = investmentHistorySeries(history)
  const bist = investmentHistorySeries(history, 'bist'), gold = investmentHistorySeries(history, 'gold')
  total.forEach((point, i) => { assert.equal(point.value, bist[i].value + gold[i].value); assert.equal(point.cost, bist[i].cost + gold[i].cost) })
  const snapshots = ['2026-02-27', '2026-02-28', '2026-03-31'].map(date => investmentSnapshot([], date))
  assert.deepEqual(investmentHistorySeries(snapshots, 'all', '1').map(p => p.date), ['2026-02-28', '2026-03-31'])
  assert.deepEqual(investmentHistorySeries([]), [])
  assert.equal(investmentHistorySeries([{ date: 'invalid', groups: {} }, ...history]).length, 6)
})

test('manual history validates nonnegative valuations and calendar dates', () => {
  const values = { date: '2026-10-01', bistCost: '100', bistValue: '125.5', goldCost: '0', goldValue: '0' }
  const snapshot = validateInvestmentHistory(values)
  assert.equal(snapshot.source, 'manual')
  assert.deepEqual(snapshot.groups.bist, { cost: 100, value: 125.5 })
  assert.equal(investmentHistorySeries([snapshot])[0].value, 125.5)
  assert.throws(() => validateInvestmentHistory({ ...values, date: '2026-02-30' }))
  assert.throws(() => validateInvestmentHistory({ ...values, date: '9999-12-01' }))
  assert.throws(() => validateInvestmentHistory({ ...values, goldValue: -1 }))
  assert.throws(() => validateInvestmentHistory({ ...values, bistValue: Infinity }))
  const saved = { ...createFinanceDemo(), investmentHistory: [snapshot] }
  assert.deepEqual(migrateFinanceData(saved, createFinanceDemo()).investmentHistory, [snapshot])
})
