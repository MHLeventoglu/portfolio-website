// Conservative text-PDF extraction. Amount columns are deliberately not guessed.
const datePattern = /\b(\d{2}[./-]\d{2}[./-]\d{4}|\d{4}-\d{2}-\d{2})\b/g
const amountPattern = /(?<![\d\w])[-+−]?(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}(?:\s*(?:TL|TRY|₺))?(?!\d)/g

export function statementDate(value) {
  const text = String(value).trim()
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : text.replace(/^(\d{2})[./-](\d{2})[./-](\d{4})$/, '$3-$2-$1')
  const date = new Date(`${iso}T12:00:00Z`)
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : ''
}

export function statementAmount(value) {
  const cleaned = String(value).replace(/(?:TL|TRY|₺|\s)/g, '').replace('−', '-')
  if (!/^[-+]?(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}$/.test(cleaned)) return null
  const amount = Number(cleaned.replaceAll('.', '').replace(',', '.'))
  return Number.isFinite(amount) ? amount : null
}

export function pdfTextLines(items) {
  const lines = []
  for (const item of items.filter(item => typeof item.str === 'string' && item.str.trim()).sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4])) {
    const y = item.transform[5]
    let line = lines.find(line => Math.abs(line.y - y) < 2.5)
    if (!line) { line = { y, items: [] }; lines.push(line) }
    line.items.push(item)
  }
  return lines.map(line => line.items.sort((a, b) => a.transform[4] - b.transform[4]).map(item => item.str).join(' ').replace(/\s+/g, ' ').trim())
}

export function parseStatementLines(pages) {
  const rows = []
  let datedLines = 0
  for (const [pageIndex, lines] of pages.entries()) {
    for (const [lineIndex, raw] of lines.entries()) {
      const dates = [...raw.matchAll(datePattern)]
      if (!dates.length) continue
      datedLines++
      // A period heading containing two dates is not a transaction.
      if (dates[0].index > 8 || /(?:dönem|tarih aralığı|devir|devreden|açılış|kapanış|toplam)/i.test(raw.toLocaleLowerCase('tr'))) continue
      const afterDate = raw.slice(dates[0].index + dates[0][0].length).replace(/^\s*\d{2}:\d{2}(?::\d{2})?\s*/, '')
      const candidates = [...afterDate.matchAll(amountPattern)].map(match => ({ text: match[0].trim(), value: statementAmount(match[0]) }))
      const title = afterDate.replace(datePattern, '').replace(amountPattern, '').replace(/\s+/g, ' ').trim()
      if (!title || !candidates.length) continue
      const only = candidates.length === 1 ? candidates[0] : null
      rows.push({ id: `p${pageIndex + 1}-l${lineIndex + 1}`, date: statementDate(dates[0][0]), title: title.slice(0, 240), amount: only ? String(Math.abs(only.value)) : '', type: only && /^[-−]/.test(only.text) ? 'expense' : only?.text.startsWith('+') ? 'income' : '', category: 'other', candidates, raw, page: pageIndex + 1, selected: false })
    }
  }
  return { rows, datedLines }
}

export function statementFingerprint(transaction) {
  return [transaction.account, transaction.date, transaction.type, Math.round(Number(transaction.amount) * 100), transaction.title.normalize('NFKC').toLocaleLowerCase('tr').replace(/\s+/g, ' ').trim()].join('|')
}

export function validStatementRow(row) {
  return !!statementDate(row.date) && !!row.title.trim() && Number.isFinite(Number(row.amount)) && Number(row.amount) > 0 && Number(row.amount) <= 100000000 && Math.abs(Number(row.amount) * 100 - Math.round(Number(row.amount) * 100)) < 0.00001 && ['income', 'expense'].includes(row.type) && (row.type === 'income' || ['home', 'food', 'shopping', 'transport', 'fun', 'health'].includes(row.category))
}

export function prepareStatementImport(rows, existing, account, batchId, fileHash) {
  const seen = new Set(existing.map(statementFingerprint)), transactions = []
  let duplicates = 0
  for (const row of rows.filter(row => row.selected)) {
    if (!validStatementRow(row)) throw new Error('Seçili satırların tarih, açıklama, tutar, tür ve kategorisini kontrol edin.')
    const transaction = { id: `${batchId}-${row.id}`, date: row.date, title: row.title.trim(), amount: Number(row.amount), type: row.type, category: row.type === 'income' ? 'income' : row.category, account, note: 'Kuveyt Türk PDF ekstresinden içe aktarıldı.', importBatch: batchId, importSource: { hash: fileHash, row: row.id, bank: 'kuveytturk' } }
    const fingerprint = statementFingerprint(transaction)
    if (seen.has(fingerprint) || existing.some(t => t.account === account && t.importSource?.hash === fileHash && t.importSource?.row === row.id)) { duplicates++; continue }
    seen.add(fingerprint)
    transactions.push(transaction)
  }
  return { transactions, duplicates }
}
