import { useRef, useState } from 'react'
import { FileUp, ShieldCheck, X, Check, Undo2 } from 'lucide-react'
import { accounts as demoAccounts, categories, money } from '../../lib/financeDemo'
import { prepareStatementImport, statementAmount, validStatementRow } from '../../lib/financeStatement'

export default function StatementImport({ transactions, imports = [], onImport, onUndo, accounts = demoAccounts, cloud = false }) {
  const [document, setDocument] = useState(null), [rows, setRows] = useState([])
  const [account, setAccount] = useState('daily'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [result, setResult] = useState('')
  const [isTRY, setIsTRY] = useState(false)
  const request = useRef(0), input = useRef(null)
  const update = (id, values) => setRows(current => current.map(row => row.id === id ? { ...row, ...values, selected: false } : row))
  const preview = document ? prepareStatementImport(rows.filter(row => !row.selected || validStatementRow(row)), transactions, account, 'preview', document.hash) : { transactions: [], duplicates: 0 }
  const selected = rows.filter(row => row.selected).length
  const load = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    const current = ++request.current
    setBusy(true); setError(''); setResult(''); setDocument(null); setRows([]); setIsTRY(false)
    try {
      const { readStatementPDF } = await import('../../lib/readStatementPDF')
      const parsed = await readStatementPDF(file)
      if (current === request.current) { setDocument(parsed); setRows(parsed.rows) }
    } catch (failure) { if (current === request.current) setError(failure.message || 'PDF okunamadı.') }
    finally { if (current === request.current) setBusy(false); event.target.value = '' }
  }
  const clear = () => { request.current++; setDocument(null); setRows([]); setError(''); setBusy(false); setIsTRY(false) }
  return <section className="fin-panel fin-statement" aria-labelledby="statement-title">
    <div className="fin-panel-heading"><div><h2 id="statement-title">Hesap ekstresi yükle</h2><p>Kuveyt Türk · PDF’den işlemlere</p></div><FileUp size={21} /></div>
    <div className="fin-statement-intro"><p>Metin içeren TL hesap ekstrenizi yükleyin. Tutarı, gelir/gider yönünü ve kategoriyi kontrol edip her satırı onaylayın. Eşleşen kayıtlar tekrar eklenmez.</p><button className="fin-button secondary" disabled={busy} onClick={() => input.current?.click()}><FileUp size={16} />{busy ? 'PDF okunuyor…' : 'PDF seç'}</button><input className="fin-sr-only" ref={input} type="file" tabIndex={-1} accept=".pdf,application/pdf" aria-label="Kuveyt Türk PDF ekstresi" onChange={load} /></div>
    <p className="fin-statement-privacy"><ShieldCheck size={13} />PDF cihazınızda okunur ve sunucuya gönderilmez. {cloud ? 'Onaylanan işlemler kişisel Supabase alanınıza kaydedilir.' : 'Onaylanan işlemler bu tarayıcıda saklanır.'} En fazla 10 MB / 100 sayfa.</p>
    <p className="fin-context-note">Bu sürüm gerçek Kuveyt Türk ekstrenizle henüz doğrulanmadı. Çok satırlı açıklamalar ve farklı PDF düzenleri eksik okunabilir; ekstreyle karşılaştırın. Yalnızca TL hesap hareketleri içindir; döviz, altın ve kredi kartı ekstresi desteklenmez.</p>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    {result && <p className="fin-import-result" role="status"><Check size={15} />{result}</p>}
    {document && <div className="fin-statement-preview">
      <header><div><strong>{document.filename}</strong><p>{document.pageCount} sayfa · {rows.length} işlem adayı · {document.datedLines} tarih içeren satır</p></div><button className="fin-icon-button" aria-label="Ekstre önizlemesini kapat" onClick={clear}><X size={18} /></button></header>
      <div className="fin-form"><label>İşlemlerin ekleneceği hesap<select aria-label="Ekstre hesabı" value={account} onChange={event => { setAccount(event.target.value); setRows(current => current.map(row => ({ ...row, selected: false }))) }}>{accounts.map(a => <option value={a.id} key={a.id}>{a.name}</option>)}</select></label></div>
      <label className="fin-import-currency"><input type="checkbox" checked={isTRY} onChange={event => setIsTRY(event.target.checked)} />Bu dosya TL hesap hareketlerimi içeriyor; döviz veya kredi kartı ekstresi değil.</label>
      {accounts.find(item => item.id === account)?.openingDate && rows.some(row => row.date && row.date < accounts.find(item => item.id === account).openingDate) && <p className="fin-context-note">Bazı işlemler hesabın açılış tarihinden önce. Bu kayıtlar işlem geçmişine eklenir; açılış bakiyesinde zaten yer aldıkları için bakiyeye tekrar eklenmez. Gerekirse Hesaplar sayfasından açılış tarihini kontrol edin.</p>}
      <p className="fin-context-note">Bir satırda işlem tutarı ve bakiye birlikte bulunabilir. Birden fazla tutar varsa doğru olanı seçin. İşaret taşımayan tutarlarda gelir/gider yönünü siz belirleyin. Alan değiştirilince satırın onayı kaldırılır.</p>
      {!rows.length && <div className="fin-empty"><p>İşlem adayı bulunamadı. PDF’nin metin düzeni bu okuyucuya uymuyor. İşlemleri üstteki formdan elle ekleyebilirsiniz.</p></div>}
      <div className="fin-import-rows">{rows.map((row, index) => <article className="fin-import-row" key={row.id}>
        <div className="fin-import-row-heading"><strong>{index + 1}. satır <small>Sayfa {row.page}</small></strong><label><input type="checkbox" aria-label={`${index + 1}. satırı onayla`} checked={row.selected} disabled={!validStatementRow(row)} onChange={event => setRows(current => current.map(r => r.id === row.id ? { ...r, selected: event.target.checked } : r))} />Kontrol ettim</label></div>
        <div className="fin-form fin-import-fields">
          <label>Tarih<input type="date" aria-label={`${index + 1}. işlem tarihi`} value={row.date} onChange={event => update(row.id, { date: event.target.value })} /></label>
          <label className="fin-import-description">Açıklama<input maxLength={240} aria-label={`${index + 1}. işlem açıklaması`} value={row.title} onChange={event => update(row.id, { title: event.target.value })} /></label>
          <label>Tutar (₺)<input type="number" min="0.01" max="100000000" step="0.01" aria-label={`${index + 1}. işlem tutarı`} value={row.amount} onChange={event => update(row.id, { amount: event.target.value })} /></label>
          {row.candidates.length > 1 && <label className="fin-import-candidates">PDF’deki tutarlar<select aria-label={`${index + 1}. PDF tutarını seç`} value="" onChange={event => { const candidate = row.candidates[Number(event.target.value)]; update(row.id, { amount: String(Math.abs(statementAmount(candidate.text))), type: /^[-−]/.test(candidate.text) ? 'expense' : candidate.text.startsWith('+') ? 'income' : '' }) }}><option value="">İşlem tutarını seçin…</option>{row.candidates.map((c, i) => <option key={i} value={i}>{i + 1}. tutar · {c.text}</option>)}</select></label>}
          <label>Tür<select aria-label={`${index + 1}. işlem türü`} value={row.type} onChange={event => update(row.id, { type: event.target.value })}><option value="">Seçin…</option><option value="expense">Gider</option><option value="income">Gelir</option></select></label>
          {row.type !== 'income' && <label>Kategori<select aria-label={`${index + 1}. işlem kategorisi`} value={row.category} onChange={event => update(row.id, { category: event.target.value })}><option value="other">Seçin…</option>{categories.filter(c => c.id !== 'income').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>}
        </div><details><summary>PDF satırını karşılaştır</summary><p>{row.raw}</p></details>
      </article>)}</div>
      <div className="fin-import-confirm"><div aria-live="polite"><strong>{preview.transactions.length} yeni işlem · {preview.duplicates} eşleşen kayıt atlanacak</strong><p>Gelir {money(preview.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), 2)} · Gider {money(preview.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), 2)}</p></div><button className="fin-button" disabled={!isTRY || !selected || !preview.transactions.length} onClick={async () => {
        try {
          const batchId = crypto.randomUUID(), prepared = prepareStatementImport(rows, transactions, account, batchId, document.hash)
          if (!prepared.transactions.length) return
          if (await onImport(prepared.transactions, { id: batchId, bank: 'kuveytturk', hash: document.hash, count: prepared.transactions.length, createdAt: new Date().toISOString() }) === false) return
          setResult(`${prepared.transactions.length} işlem eklendi; ${prepared.duplicates} eşleşen kayıt atlandı.`); clear()
        } catch (failure) { setError(failure.message) }
      }}>Onaylananları içe aktar</button></div>
    </div>}
    {imports.some(batch => transactions.some(t => t.importBatch === batch.id)) && <details className="fin-import-history"><summary>İçe aktarma geçmişi</summary>{imports.filter(batch => transactions.some(t => t.importBatch === batch.id)).slice().reverse().map(batch => <div key={batch.id}><span>Kuveyt Türk · {batch.count} işlem · {new Date(batch.createdAt).toLocaleDateString('tr-TR')}</span><button className="fin-text-button" onClick={async () => { if (await onUndo(batch.id) !== false) setResult('Bu yüklemeyle eklenen işlemler geri alındı.') }}><Undo2 size={14} />Bu aktarımı geri al</button></div>)}</details>}
  </section>
}
