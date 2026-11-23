import test from 'node:test'
import assert from 'node:assert/strict'
import { parseStatementLines, pdfTextLines, statementDate, statementAmount, prepareStatementImport, validStatementRow } from '../src/lib/financeStatement.js'

test('Turkish dates and monetary amounts reject ambiguous or invalid values', () => {
  assert.equal(statementDate('29.02.2024'), '2024-02-29')
  assert.equal(statementDate('31.02.2026'), '')
  assert.equal(statementDate('2025-12-31'), '2025-12-31')
  assert.equal(statementAmount('−1.234,56 TL'), -1234.56)
  assert.equal(statementAmount('+23,45'), 23.45)
  assert.equal(statementAmount('1,234.56'), null)
})

test('PDF geometric lines preserve columns and require amount/direction review', () => {
  const item = (str, x, y) => ({ str, transform: [1, 0, 0, 1, x, y] })
  const lines = pdfTextLines([item('8.766,00', 400, 650), item('01.12.2025', 20, 650), item('Market', 100, 650), item('-1.234,00', 300, 650), item('02.12.2025 Maas +20.000,00', 20, 630)])
  const result = parseStatementLines([['Donem 01.12.2025 - 31.12.2025', ...lines, '03.12.2025 Havale 50,00', '04.12.2025 Devir 100,00']])
  assert.equal(result.rows.length, 3)
  assert.equal(result.rows[0].candidates.length, 2)
  assert.equal(result.rows[0].amount, '')
  assert.equal(result.rows[1].type, 'income')
  assert.equal(result.rows[2].type, '')
  assert.ok(result.rows.every(row => !row.selected))
})

test('import validates reviewed rows, detects duplicates and preserves source identity', () => {
  const row = { id: 'p1-l2', date: '2025-12-01', title: 'Market', type: 'expense', category: 'food', amount: '1234.56', selected: true }
  assert.equal(validStatementRow({ ...row, category: 'other' }), false)
  assert.equal(validStatementRow({ ...row, type: '' }), false)
  assert.equal(validStatementRow({ ...row, amount: '1.001' }), false)
  assert.throws(() => prepareStatementImport([{ ...row, date: '' }], [], 'daily', 'a', 'hash'))
  const imported = prepareStatementImport([row, { ...row, id: 'p1-l3' }], [], 'daily', 'a', 'hash')
  assert.equal(imported.transactions.length, 1)
  assert.equal(imported.duplicates, 1)
  assert.equal(imported.transactions[0].importSource.hash, 'hash')
  assert.equal(prepareStatementImport([row], imported.transactions, 'daily', 'b', 'hash').duplicates, 1)
  assert.equal(prepareStatementImport([{ ...row, title: 'Düzenlenmiş açıklama' }], imported.transactions, 'daily', 'b', 'hash').duplicates, 1)
  assert.equal(prepareStatementImport([row], imported.transactions, 'savings', 'b', 'hash').transactions.length, 1)
  assert.equal(prepareStatementImport([{ ...row, selected: false }], [], 'daily', 'b', 'hash').transactions.length, 0)
})
