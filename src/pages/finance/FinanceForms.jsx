import { createElement, useRef, useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { money, categories } from '../../lib/financeDemo'
import { investmentTypes, validateGoal, adjustGoal, validateInvestment, tradeInvestment, todayInIstanbul, investmentSnapshot, validateInvestmentHistory } from '../../lib/financePortfolio'

function FormActions({ onClose, label = 'Kaydet' }) {
  return <div className="fin-form-actions"><button type="button" className="fin-button secondary" onClick={onClose}>Vazgeç</button><button className="fin-button" type="submit">{label}</button></div>
}

export function AccountForm({ account, onSave, onClose }) {
  const [error, setError] = useState('')
  return <form className="fin-form" onSubmit={event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget), opening = Number(form.get('opening')), name = form.get('name').trim(), institution = form.get('institution').trim(), openingDate = form.get('openingDate') || null
    if (!name || !institution || !Number.isFinite(opening) || Math.abs(opening) > 1e12 || opening !== 0 && !openingDate) { setError('Hesap adını, kurumunu ve geçerli açılış bakiyesi/tarihini girin.'); return }
    void onSave({ id: account.id, name, institution, opening, openingDate, suffix: form.get('suffix').trim() || null, color: account.color })
  }}>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <label>Hesap adı<input name="name" defaultValue={account.name} maxLength={80} required /></label>
    <label>Banka / kurum<input name="institution" defaultValue={account.institution} maxLength={100} required /></label>
    <div className="fin-form-grid"><label>Açılış bakiyesi (₺)<input name="opening" type="number" min="-1000000000000" max="1000000000000" step="0.01" defaultValue={account.opening} required /></label><label>Açılış tarihi<input name="openingDate" type="date" min="1900-01-01" defaultValue={account.openingDate || ''} /></label></div>
    <label>Hesap son dört hanesi <span>(isteğe bağlı)</span><input name="suffix" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" defaultValue={account.suffix || ''} /></label>
    <p className="fin-form-note">Açılış bakiyesi, seçtiğiniz günün işlemlerinden önceki tutardır. Bu tarihten önceki işlemler geçmişte görünür; bakiyeye yeniden eklenmez. İlk ekstrenizin başlangıç bakiyesini kullanabilirsiniz.</p><FormActions onClose={onClose} />
  </form>
}

export function BillForm({ accounts, onSave, onClose }) {
  const [error, setError] = useState('')
  const id = useRef(null)
  return <form className="fin-form" onSubmit={event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget), name = form.get('name').trim(), amount = Number(form.get('amount'))
    if (!name || !Number.isFinite(amount) || amount <= 0) { setError('Ödeme adı ve sıfırdan büyük bir tutar girin.'); return }
    id.current ||= crypto.randomUUID()
    void onSave({ id: id.current, name, amount, date: form.get('date'), category: form.get('category'), account: form.get('account'), paid: false })
  }}>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <label>Ödeme adı<input name="name" placeholder="Örn. İnternet faturası" maxLength={80} required /></label>
    <div className="fin-form-grid"><label>Tutar (₺)<input name="amount" type="number" min="0.01" max="1000000000000" step="0.01" required /></label><label>Ödeme tarihi<input name="date" type="date" min="1900-01-01" defaultValue={todayInIstanbul()} required /></label></div>
    <div className="fin-form-grid"><label>Kategori<select name="category">{categories.filter(category => category.id !== 'income').map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label><label>Ödeme hesabı<select name="account">{accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label></div>
    <p className="fin-form-note">Plan eklemek bakiyeyi değiştirmez. “Ödendi” olarak işaretlediğinizde tek bir gider kaydı oluşturulur.</p><FormActions onClose={onClose} label="Ödeme planına ekle" />
  </form>
}

export function GoalForm({ goal, onSave, onClose }) {
  const [error, setError] = useState('')
  return <form className="fin-form" onSubmit={event => {
    event.preventDefault()
    try { onSave({ ...validateGoal(Object.fromEntries(new FormData(event.currentTarget))), id: goal?.id || crypto.randomUUID() }) } catch (err) { setError(err.message) }
  }}>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <label>Hedef adı<input name="name" defaultValue={goal?.name || ''} placeholder="Örn. Yeni bilgisayar" maxLength={80} required /></label>
    <div className="fin-form-grid"><label>Hedef tutarı (₺)<input name="target" type="number" min="0.01" max="1000000000" step="0.01" defaultValue={goal?.target ?? ''} required /></label><label>Mevcut birikim (₺)<input name="saved" type="number" min="0" max="1000000000" step="0.01" defaultValue={goal?.saved ?? 0} required /></label></div>
    <label>Hedef tarihi <span>(isteğe bağlı)</span><input type="month" name="deadline" defaultValue={goal?.deadline || ''} /></label>
    <div className="fin-form-grid"><label>Simge<select name="icon" aria-label="Hedef simgesi" defaultValue={goal?.icon || 'shield'}><option value="shield">Birikim</option><option value="travel">Seyahat</option><option value="studio">Çalışma alanı</option></select></label><label>Renk<select name="color" aria-label="Hedef rengi" defaultValue={goal?.color || 'teal'}><option value="teal">Turkuaz</option><option value="lilac">Lila</option><option value="peach">Şeftali</option></select></label></div>
    <p className="fin-form-note">Hedef için ayrılan tutar hesap bakiyelerini değiştirmez.</p><FormActions onClose={onClose} label={goal ? 'Değişiklikleri kaydet' : 'Hedefi oluştur'} />
  </form>
}

export function GoalAdjustmentForm({ goal, direction = 'add', onSave, onClose }) {
  const [mode, setMode] = useState(direction), [error, setError] = useState('')
  return <form className="fin-form" onSubmit={event => { event.preventDefault(); try { onSave(adjustGoal(goal, new FormData(event.currentTarget).get('amount'), mode)) } catch (err) { setError(err.message) } }}>
    <div className="fin-segment fin-form-type">{[['add', 'Birikim ekle', Plus], ['withdraw', 'Birikim çıkar', Minus]].map(([value, label, Icon]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setError('') }}>{createElement(Icon, { size: 13 })}{label}</button>)}</div>
    <p><strong>{goal.name}</strong><br />Mevcut birikim: {money(goal.saved, 2)}</p>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <label>Tutar (₺)<input name="amount" type="number" min="0.01" max={mode === 'withdraw' ? goal.saved : 1000000000} step="0.01" placeholder="0,00" required /></label>
    <p className="fin-form-note">Bu işlem hedefe ayrılan birikimi değiştirir; gelir veya gider oluşturmaz.</p><FormActions onClose={onClose} label={mode === 'add' ? 'Birikim ekle' : 'Birikim çıkar'} />
  </form>
}

export function InvestmentForm({ position, onSave, onClose }) {
  const [kind, setKind] = useState(position?.kind || 'bist'), [error, setError] = useState('')
  const unit = investmentTypes.find(t => t.id === kind).unit
  return <form className="fin-form" onSubmit={event => {
    event.preventDefault()
    try {
      const values = validateInvestment({ ...Object.fromEntries(new FormData(event.currentTarget)), kind })
      const quoteChanged = !position || position.price !== values.price || position.priceDate !== values.priceDate || position.kind !== values.kind || position.symbol !== values.symbol
      onSave({ ...position, ...values, id: position?.id || crypto.randomUUID(), source: quoteChanged ? 'manual' : position.source })
    } catch (err) { setError(err.message) }
  }}>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <label>Varlık türü<select aria-label="Varlık türü" value={kind} onChange={event => setKind(event.target.value)}>{investmentTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
    <div className="fin-form-grid"><label>Kod<input name="symbol" defaultValue={position?.symbol || ''} placeholder={kind === 'bist' ? 'THYAO' : 'GRAM'} maxLength={16} required /></label><label>Varlık adı<input name="name" defaultValue={position?.name || ''} placeholder={kind === 'bist' ? 'Türk Hava Yolları' : 'Gram altın'} maxLength={80} required /></label></div>
    <div className="fin-form-grid"><label>Miktar ({unit})<input name="quantity" type="number" min="0.00000001" max="1000000000" step="any" defaultValue={position?.quantity ?? ''} required /></label><label>Ort. alış maliyeti (₺/{unit})<input name="averageCost" type="number" min="0.00000001" max="1000000000" step="any" defaultValue={position?.averageCost ?? ''} required /></label></div>
    <div className="fin-form-grid"><label>Son fiyat (₺/{unit})<input name="price" type="number" min="0.00000001" max="1000000000" step="any" defaultValue={position?.price ?? ''} required /></label><label>Fiyat tarihi<input name="priceDate" type="date" defaultValue={position?.priceDate || todayInIstanbul()} required /></label></div>
    <p className="fin-form-note">Miktar ve fiyatı elle girin. Bu kayıt nakit hesaplarını değiştirmez.</p><FormActions onClose={onClose} label={position ? 'Değişiklikleri kaydet' : 'Varlığı ekle'} />
  </form>
}

export function InvestmentTradeForm({ position, onSave, onClose }) {
  const [direction, setDirection] = useState('buy'), [error, setError] = useState('')
  const unit = investmentTypes.find(t => t.id === position.kind)?.unit || 'adet'
  return <form className="fin-form" onSubmit={event => { event.preventDefault(); try { onSave(tradeInvestment(position, { ...Object.fromEntries(new FormData(event.currentTarget)), direction }), direction) } catch (err) { setError(err.message) } }}>
    <div className="fin-segment fin-form-type">{[['buy', 'Alım ekle'], ['sell', 'Satış ekle']].map(([value, label]) => <button type="button" key={value} aria-pressed={direction === value} onClick={() => { setDirection(value); setError('') }}>{label}</button>)}</div>
    <p><strong>{position.symbol} · {position.name}</strong><br />Mevcut miktar: {position.quantity.toLocaleString('tr-TR', { maximumFractionDigits: 8 })} {unit}</p>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <div className="fin-form-grid"><label>Miktar ({unit})<input name="quantity" type="number" min="0.00000001" max={direction === 'sell' ? position.quantity : 1000000000} step="any" required /></label><label>İşlem birim fiyatı (₺)<input name="price" type="number" min="0.00000001" max="1000000000" step="any" defaultValue={position.price} required /></label></div>
    <p className="fin-form-note">Alım ortalama maliyeti günceller. Satış miktarı azaltır; tamamı satılırsa pozisyon kapanır. Nakit hesapları ve son değerleme fiyatı değişmez.</p><FormActions onClose={onClose} label={direction === 'buy' ? 'Alımı kaydet' : 'Satışı kaydet'} />
  </form>
}

export function InvestmentPricesForm({ positions, onSave, onClose }) {
  const [error, setError] = useState('')
  return <form className="fin-form" onSubmit={event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try { onSave(Object.fromEntries(positions.map(p => [p.id, form.get(`price-${p.id}`)])), form.get('priceDate')) } catch (err) { setError(err.message) }
  }}>
    <p>Değerleme için kullanmak istediğiniz birim fiyatları girin. Tüm tutarlar Türk lirasıdır.</p>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <div className="fin-price-fields">{positions.map(position => <label key={position.id}>{position.symbol}<span>{position.name}</span><input aria-label={`${position.symbol} son fiyat`} name={`price-${position.id}`} type="number" min="0.00000001" max="1000000000" step="any" defaultValue={position.price} required /></label>)}</div>
    <label>Fiyat tarihi<input name="priceDate" type="date" defaultValue={todayInIstanbul()} required /></label><p className="fin-form-note">Kaydettiğiniz fiyatlar “Elle girildi” olarak işaretlenir. Otomatik piyasa bağlantısı kullanılmaz.</p><FormActions onClose={onClose} label="Fiyatları kaydet" />
  </form>
}

export function InvestmentHistoryForm({ positions, onSave, onClose }) {
  const [error, setError] = useState('')
  const current = investmentSnapshot(positions)
  return <form className="fin-form" onSubmit={event => { event.preventDefault(); try { onSave(validateInvestmentHistory(Object.fromEntries(new FormData(event.currentTarget)))) } catch (err) { setError(err.message) } }}>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <label>Kayıt tarihi<input name="date" type="date" max={todayInIstanbul()} defaultValue={todayInIstanbul()} required /></label>
    <fieldset className="fin-history-fields"><legend>BIST</legend><div className="fin-form-grid"><label>Alış maliyeti (₺)<input aria-label="Geçmiş BIST alış maliyeti" name="bistCost" type="number" min="0" max="1000000000000" step="0.01" defaultValue={current.groups.bist.cost.toFixed(2)} required /></label><label>Portföy değeri (₺)<input aria-label="Geçmiş BIST portföy değeri" name="bistValue" type="number" min="0" max="1000000000000" step="0.01" defaultValue={current.groups.bist.value.toFixed(2)} required /></label></div></fieldset>
    <fieldset className="fin-history-fields"><legend>Altın</legend><div className="fin-form-grid"><label>Alış maliyeti (₺)<input aria-label="Geçmiş altın alış maliyeti" name="goldCost" type="number" min="0" max="1000000000000" step="0.01" defaultValue={current.groups.gold.cost.toFixed(2)} required /></label><label>Portföy değeri (₺)<input aria-label="Geçmiş altın portföy değeri" name="goldValue" type="number" min="0" max="1000000000000" step="0.01" defaultValue={current.groups.gold.value.toFixed(2)} required /></label></div></fieldset>
    <p className="fin-form-note">Bu kayıt grafiğe eklenir; güncel varlıklarınızı değiştirmez. Aynı tarihte bir kayıt varsa onun yerini alır.</p><FormActions onClose={onClose} label="Geçmiş değeri kaydet" />
  </form>
}
