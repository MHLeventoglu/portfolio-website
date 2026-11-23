import { createElement, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ArrowLeft, Plus, Wallet, LayoutGrid, ArrowLeftRight, ChartNoAxesCombined, Landmark, Target, Search, Download, X, House, Utensils, ShoppingBag, Bus, Ticket, HeartPulse, BriefcaseBusiness, ShieldCheck, Plane, Monitor, ChevronRight, Check, SlidersHorizontal, RotateCcw, CalendarDays, Trash2, Minus, TrendingUp } from 'lucide-react'
import Logo from '../../components/common/Logo'
import LiquidGlassNav from '../../components/common/LiquidGlassNav'
import AdminAtmosphere from '../../components/admin/AdminAtmosphere'
import AdminThemeToggle from '../../components/admin/AdminThemeToggle'
import { DEMO_MONTH, months, categories, accounts as demoAccounts, createFinanceDemo, filterTransactions, summarize, categoryTotals, accountBalance, money, monthLabel, dateLabel, transactionCSV } from '../../lib/financeDemo'
import { updateInvestmentPrices, upsertInvestmentSnapshot, todayInIstanbul } from '../../lib/financePortfolio'
import { GoalForm, GoalAdjustmentForm, InvestmentForm, InvestmentTradeForm, InvestmentPricesForm, InvestmentHistoryForm, AccountForm, BillForm } from './FinanceForms'
import Investments from './Investments'
import StatementImport from './StatementImport'
import { useData } from '../../context/DataContext'
import useFinanceWorkspace from './useFinanceWorkspace'
import './Finance.css'

const navigation = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutGrid },
  { id: 'transactions', label: 'İşlemler', icon: ArrowLeftRight },
  { id: 'budgets', label: 'Bütçeler', icon: ChartNoAxesCombined },
  { id: 'accounts', label: 'Hesaplar', icon: Landmark },
  { id: 'investments', label: 'Yatırımlar', icon: TrendingUp },
  { id: 'goals', label: 'Hedefler', icon: Target }
]
const icons = { home: House, food: Utensils, shopping: ShoppingBag, transport: Bus, fun: Ticket, health: HeartPulse, income: BriefcaseBusiness, shield: ShieldCheck, travel: Plane, studio: Monitor }
const expenseCategories = categories.filter(c => c.id !== 'income')
const goalMoney = value => money(value, Number.isInteger(value) ? 0 : 2)
const percent = value => `%${Math.abs(value).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`

function Icon({ name, size = 18 }) { return createElement(icons[name] || Wallet, { size, 'aria-hidden': true }) }

function Panel({ title, detail, action, children, className = '' }) {
  return <section className={`fin-panel ${className}`}><div className="fin-panel-heading"><div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>{children}</section>
}

function Sparkline({ values, color = 'var(--accent-deep)' }) {
  const max = Math.max(...values, 1), min = Math.min(...values, 0), range = max - min || 1
  const points = values.map((value, i) => `${i * 20},${35 - (value - min) / range * 28}`).join(' ')
  return <svg className="fin-sparkline" viewBox="0 0 100 40" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function CashFlow({ transactions, month, baseMonths = months }) {
  const [period, setPeriod] = useState(6)
  const [active, setActive] = useState(null)
  const [visible, setVisible] = useState({ income: true, expense: true })
  const gradient = useId().replaceAll(':', '')
  const chartMonths = [...new Set([...baseMonths, month, ...transactions.map(t => t.date.slice(0, 7))])].sort()
  const series = chartMonths.filter(m => m <= month).slice(-period).map(m => ({ month: m, ...summarize(filterTransactions(transactions, { month: m })) }))
  const selected = series.find(s => s.month === active) || series.at(-1)
  const max = Math.max(...series.flatMap(s => [visible.income ? s.income : 0, visible.expense ? s.expense : 0]), 1000) * 1.15
  const point = (value, i) => `${48 + i * 552 / Math.max(series.length - 1, 1)},${210 - value / max * 175}`
  return <Panel title="Nakit akışı" detail="Gelir ve giderlerin dönem içindeki değişimi" action={<div className="fin-segment" aria-label="Grafik aralığı">{[3, 6].map(p => <button key={p} aria-pressed={period === p} onClick={() => { setPeriod(p); setActive(null) }}>{p} ay</button>)}</div>} className="fin-flow">
    <div className="fin-chart-meta"><div className="fin-chart-readout" aria-live="polite"><span>{monthLabel(selected.month)}</span><strong>{money(selected.net)} <small>net nakit akışı</small></strong></div><div className="fin-legend">{[['income', 'Gelir'], ['expense', 'Gider']].map(([key, label]) => <button key={key} aria-pressed={visible[key]} onClick={() => setVisible(v => ({ ...v, [key]: !v[key] }))}><i className={key} style={{ opacity: visible[key] ? 1 : 0.25 }} />{label}</button>)}</div></div>
    <svg className="fin-flow-svg" viewBox="0 0 640 240" role="img" aria-label={`Aylık nakit akışı. ${monthLabel(selected.month)}: gelir ${money(selected.income)}, gider ${money(selected.expense)}.`}>
      <defs><linearGradient id={`${gradient}-fill`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity="0.19" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
      {[0, 1, 2, 3].map(i => <g key={i}><line x1="48" x2="610" y1={35 + i * 58.33} y2={35 + i * 58.33} stroke="var(--line)" strokeDasharray="3 6" /><text x="0" y={39 + i * 58.33}>{Math.round(max * (1 - i / 3) / 1000)} bin</text></g>)}
      {visible.income && <><polygon points={`48,210 ${series.map((s, i) => point(s.income, i)).join(' ')} ${48 + (series.length - 1) * 552 / Math.max(series.length - 1, 1)},210`} fill={`url(#${gradient}-fill)`} /><polyline points={series.map((s, i) => point(s.income, i)).join(' ')} fill="none" stroke="var(--accent-deep)" strokeWidth="2.5" strokeLinejoin="round" /></>}
      {visible.expense && <polyline points={series.map((s, i) => point(s.expense, i)).join(' ')} fill="none" stroke="var(--fin-lilac)" strokeWidth="2.5" strokeLinejoin="round" />}
      {series.map((s, i) => <g key={s.month} onMouseEnter={() => setActive(s.month)}><line x1={48 + i * 552 / Math.max(series.length - 1, 1)} x2={48 + i * 552 / Math.max(series.length - 1, 1)} y1="24" y2="210" stroke={selected.month === s.month ? 'var(--line-strong)' : 'transparent'} strokeDasharray="3 4" />{['income', 'expense'].filter(key => visible[key]).map(key => <circle key={key} cx={48 + i * 552 / Math.max(series.length - 1, 1)} cy={210 - s[key] / max * 175} r={selected.month === s.month ? 4.5 : 3} fill={key === 'income' ? 'var(--accent-deep)' : 'var(--fin-lilac)'} stroke="var(--paper-2)" strokeWidth="2" />)}<rect x={28 + i * 552 / Math.max(series.length - 1, 1)} y="20" width="40" height="200" fill="transparent" /></g>)}
    </svg>
    <div className="fin-chart-months">{series.map(s => <button key={s.month} aria-pressed={selected.month === s.month} onClick={() => setActive(s.month)}>{monthLabel(s.month, true)}<span className="fin-sr-only">: gelir {money(s.income)}, gider {money(s.expense)}</span></button>)}</div>
    <div className="fin-flow-footer"><span><i className="income" />Gelir <strong>{money(selected.income)}</strong></span><span><i className="expense" />Gider <strong>{money(selected.expense)}</strong></span></div>
  </Panel>
}

function Spending({ transactions, onCategory }) {
  const [active, setActive] = useState(null)
  const totals = categoryTotals(transactions), total = summarize(transactions).expense
  const current = totals.find(c => c.id === active)
  return <Panel title="Harcama dağılımı" detail="Kategorilere göre giderler" className="fin-spending">
    <div className="fin-donut-wrap"><svg viewBox="0 0 180 180" role="img" aria-label={`Toplam gider ${money(total)}. Kategori ayrıntıları aşağıda.`}><circle cx="90" cy="90" r="72" fill="none" stroke="var(--admin-track)" strokeWidth="15" />{totals.map((c, index) => {
      const length = total ? c.amount / total * 452.39 : 0
      const start = total ? totals.slice(0, index).reduce((sum, category) => sum + category.amount, 0) / total * 452.39 : 0
      return <circle key={c.id} cx="90" cy="90" r="72" fill="none" stroke={c.color} strokeWidth={active === c.id ? 20 : 15} strokeDasharray={`${Math.max(length - 3, 0)} ${452.39 - Math.max(length - 3, 0)}`} strokeDashoffset={-start} transform="rotate(-90 90 90)" opacity={active && active !== c.id ? 0.3 : 1} />
    })}</svg><div className="fin-donut-value" aria-live="polite"><span>{current?.label || 'Toplam gider'}</span><strong>{money(current?.amount ?? total)}</strong><small>{current ? percent(total ? current.amount / total * 100 : 0) : 'Seçili dönem'}</small></div></div>
    <div className="fin-category-list">{totals.map(c => <button key={c.id} onMouseEnter={() => setActive(c.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(c.id)} onBlur={() => setActive(null)} onClick={() => onCategory(c.id)}><span><i style={{ background: c.color }} />{c.label}</span><strong>{money(c.amount)}</strong><small>{percent(total ? c.amount / total * 100 : 0)}</small></button>)}</div>
  </Panel>
}

function TransactionList({ transactions, onSelect, compact = false, accounts = demoAccounts }) {
  if (!transactions.length) return <div className="fin-empty"><Search size={28} /><h3>İşlem bulunamadı</h3><p>Arama veya filtreleri değiştirin.</p></div>
  return <div className="fin-table-scroll"><table className={`fin-transactions ${compact ? 'is-compact' : ''}`}><thead><tr><th>İşlem</th><th>Kategori</th>{!compact && <th>Hesap</th>}<th>Tarih</th><th>Tutar</th><th><span className="fin-sr-only">Ayrıntılar</span></th></tr></thead><tbody>{transactions.map(t => {
    const cat = categories.find(c => c.id === t.category)
    return <tr key={t.id}><td><button className="fin-transaction-name" onClick={() => onSelect(t)}><span className={`fin-category-icon ${t.type === 'income' ? 'is-income' : ''}`}><Icon name={t.category} size={17} /></span><span><strong>{t.title}</strong><small>{t.type === 'income' ? 'Gelir' : 'Gider'}</small></span></button></td><td><span className="fin-table-category"><i style={{ background: cat?.color }} />{cat?.label}</span></td>{!compact && <td>{accounts.find(a => a.id === t.account)?.name}</td>}<td className="fin-date">{dateLabel(t.date)}</td><td className={`fin-amount ${t.type === 'income' ? 'fin-positive' : ''}`}>{t.type === 'income' ? '+' : '−'}{money(t.amount, 2)}</td><td><button className="fin-icon-button" onClick={() => onSelect(t)} aria-label={`${t.title} ayrıntıları`}><ArrowUpRight size={16} /></button></td></tr>
  })}</tbody></table></div>
}

function BudgetCard({ category, limit, amount, onEdit }) {
  const usage = limit ? amount / limit * 100 : 0, over = limit > 0 && amount > limit
  return <article className={`fin-budget-card ${over ? 'is-over' : ''}`}><div className="fin-budget-top"><span className="fin-category-icon" style={{ color: category.color }}><Icon name={category.id} size={20} /></span><button className="fin-icon-button" onClick={onEdit} aria-label={`${category.label} bütçesini düzenle`}><SlidersHorizontal size={16} /></button></div><h3>{category.label}</h3><p className="fin-budget-amount">{money(amount)} <span>/ {money(limit)}</span></p><div className="fin-progress" role="progressbar" aria-label={`${category.label} bütçe kullanımı`} aria-valuenow={Math.round(usage)} aria-valuemin={0} aria-valuemax={Math.max(100, Math.round(usage))}><i style={{ width: `${Math.min(usage, 100)}%`, background: over ? 'var(--admin-danger)' : category.color }} /></div><div className="fin-budget-bottom"><span>{!limit ? 'Limit belirlenmedi' : over ? `${money(amount - limit)} aşıldı` : `${money(limit - amount)} kaldı`}</span><strong>{percent(usage)}</strong></div></article>
}

function GoalCard({ goal, onAdd, onWithdraw, onEdit, onDelete }) {
  const progress = Math.min(goal.saved / goal.target * 100, 100)
  return <article className={`fin-goal-card ${goal.color}`}>
    <div className="fin-goal-top"><span className="fin-category-icon"><Icon name={goal.icon} size={22} /></span><span>{goal.deadline ? monthLabel(goal.deadline) : goal.date || 'Tarih belirtilmedi'}</span><div className="fin-goal-tools"><button className="fin-icon-button" aria-label={`${goal.name} hedefini düzenle`} title="Hedefi düzenle" onClick={onEdit}><SlidersHorizontal size={14} /></button><button className="fin-icon-button fin-delete-action" aria-label={`${goal.name} hedefini sil`} title="Hedefi sil" onClick={onDelete}><Trash2 size={14} /></button></div></div>
    <h3>{goal.name}</h3><p className="fin-goal-amount">{goalMoney(goal.saved)} <span>/ {goalMoney(goal.target)}</span></p>
    <div className="fin-progress" role="progressbar" aria-label={goal.name} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }} /></div>
    <div className="fin-goal-status"><span>{percent(progress)} tamamlandı</span><span>{goal.saved >= goal.target ? 'Hedef tamamlandı' : `${goalMoney(goal.target - goal.saved)} kaldı`}</span></div>
    <div className="fin-goal-bottom"><button className="fin-text-button" disabled={!goal.saved} onClick={onWithdraw}><Minus size={14} />Birikim çıkar</button><button className="fin-text-button" onClick={onAdd}><Plus size={14} />Birikim ekle</button></div>
  </article>
}

function Modal({ title, onClose, children }) {
  const dialog = useRef(null), titleId = useId()
  useEffect(() => {
    const trigger = document.activeElement
    const element = dialog.current
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.querySelector('input, select, button')?.focus()
    const handleKey = event => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = [...element.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')]
        const first = focusable[0], last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    element.addEventListener('keydown', handleKey)
    return () => { document.body.style.overflow = previous; element.removeEventListener('keydown', handleKey); trigger?.focus() }
  }, [onClose])
  return <div className="fin-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose() }}><section className="fin-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialog}><header><h2 id={titleId}>{title}</h2><button className="fin-icon-button" onClick={onClose} aria-label="Pencereyi kapat"><X size={20} /></button></header>{children}</section></div>
}

function TransactionForm({ month, onSave, onClose, inline = false, accounts = demoAccounts, demo = false }) {
  const [type, setType] = useState('expense'), [error, setError] = useState('')
  const transactionId = useRef(null)
  return <form className={`fin-form fin-transaction-form ${inline ? 'is-inline' : ''} ${type === 'income' ? 'is-income' : ''}`} aria-label="İşlem ekleme formu" onSubmit={async event => {
    event.preventDefault()
    const element = event.currentTarget, form = new FormData(element), amount = Number(form.get('amount')), title = form.get('title').trim()
    if (!title) { setError('İşlem açıklaması girin.'); return }
    if (!Number.isFinite(amount) || amount <= 0) { setError('Sıfırdan büyük bir tutar girin.'); return }
    transactionId.current ||= crypto.randomUUID()
    if (await onSave({ id: transactionId.current, type, title, amount, date: form.get('date'), category: type === 'income' ? 'income' : form.get('category'), account: form.get('account'), note: form.get('note').trim() }) === false) return
    transactionId.current = null
    if (inline) { element.reset(); setType('expense'); setError('') }
  }}>
    {error && <p className="fin-form-error" role="alert">{error}</p>}
    <div className="fin-segment fin-form-type" role="group" aria-label="Yeni işlem türü">{[['expense', 'Gider'], ['income', 'Gelir']].map(([value, label]) => <button key={value} type="button" aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}</div>
    <label className="fin-entry-title">Açıklama<input name="title" placeholder="Örn. Market alışverişi" required maxLength={80} autoComplete="off" /></label>
    <label className="fin-entry-amount">Tutar (₺)<input name="amount" type="number" min="0.01" max="100000000" step="0.01" placeholder="0,00" required /></label>
    <label className="fin-entry-date">Tarih<input name="date" type="date" min="1900-01-01" defaultValue={todayInIstanbul().startsWith(month) ? todayInIstanbul() : `${month}-15`} required /></label>
    {type === 'expense' && <label className="fin-entry-category">Kategori<select name="category" aria-label="Kategori">{expenseCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>}
    <label className="fin-entry-account">Hesap<select name="account" aria-label="Hesap">{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
    <label className="fin-entry-note">Not <span>(isteğe bağlı)</span><textarea name="note" rows={inline ? 1 : 2} maxLength={240} placeholder="İşlem hakkında bir not" /></label>
    {!inline && demo && <p className="fin-form-note">Bu işlem yalnızca yerel demo alanına eklenir.</p>}
    <div className="fin-form-actions">{inline ? <button className="fin-button secondary" type="reset" onClick={() => { setType('expense'); setError(''); transactionId.current = null }}>Formu temizle</button> : <button className="fin-button secondary" type="button" onClick={onClose}>Vazgeç</button>}<button className="fin-button" type="submit"><Plus size={16} />{inline ? 'İşlemi kaydet' : 'İşlemi ekle'}</button></div>
  </form>
}

export default function Finance() {
  const { user } = useData()
  return <FinanceScreen key={user?.id || 'local-demo'} ownerId={user?.id} />
}

function FinanceScreen({ ownerId }) {
  const [params, setParams] = useSearchParams()
  const view = navigation.some(n => n.id === params.get('view')) ? params.get('view') : 'overview'
  const workspace = useFinanceWorkspace(ownerId)
  const { data, saving, loading, error, demo } = workspace
  const accounts = data.accounts || demoAccounts
  const [month, setMonth] = useState(() => demo ? DEMO_MONTH : todayInIstanbul().slice(0, 7))
  const [query, setQuery] = useState(''), [type, setType] = useState('all'), [category, setCategory] = useState('all'), [account, setAccount] = useState('all')
  const [modal, setModal] = useState(null), [notice, setNotice] = useState(''), [reloadKey, setReloadKey] = useState(0)
  const closeModal = useCallback(() => setModal(null), [])
  useEffect(() => { window.scrollTo(0, 0) }, [view])
  const commit = async (updater, message, after = closeModal) => {
    if (!await workspace.update(updater)) return false
    after?.()
    if (message) setNotice(message)
    return true
  }
  const reload = async () => { if (await workspace.reload()) { closeModal(); setReloadKey(key => key + 1); setNotice('Güncel sunucu kaydı yüklendi.') } }
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(timer) }, [notice])
  const monthTransactions = useMemo(() => filterTransactions(data.transactions, { month }), [data.transactions, month])
  const totals = summarize(monthTransactions), spending = categoryTotals(monthTransactions)
  const availableMonths = [...new Set([...(demo ? months : []), ...data.transactions.map(t => t.date.slice(0, 7)), month])].sort()
  const monthly = availableMonths.map(m => summarize(filterTransactions(data.transactions, { month: m })))
  const balances = accounts.map(a => ({ ...a, balance: accountBalance(a, data.transactions, month) }))
  const balance = balances.reduce((sum, a) => sum + a.balance, 0)
  const budgetTotal = Object.values(data.budgets).reduce((sum, value) => sum + value, 0)
  const filtered = filterTransactions(data.transactions, { month, query, type, category, account })
  const filteredTotals = summarize(filtered)
  const changeView = (next, cat = 'all', selectedAccount = 'all') => { setParams(next === 'overview' ? {} : { view: next }); setCategory(cat); setAccount(selectedAccount); setQuery(''); setType('all') }
  const saveTransaction = transaction => commit(d => ({ ...d, transactions: d.transactions.some(t => t.id === transaction.id) ? d.transactions : [...d.transactions, transaction] }), 'İşlem kaydedildi.', () => { setMonth(transaction.date.slice(0, 7)); closeModal() })
  const payBill = bill => commit(d => ({ ...d, bills: d.bills.map(b => b.id === bill.id ? { ...b, paid: true } : b), transactions: d.transactions.some(t => t.id === `bill-${bill.id}`) ? d.transactions : [...d.transactions, { id: `bill-${bill.id}`, title: bill.name, amount: bill.amount, category: bill.category, account: bill.account || 'daily', type: 'expense', date: bill.date, note: 'Planlanan ödeme' }] }), `${bill.name} ödendi olarak kaydedildi.`)
  const exportCSV = () => {
    const url = URL.createObjectURL(new Blob([transactionCSV(filtered, accounts)], { type: 'text/csv;charset=utf-8;' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `mhl-islemler-${month}.csv`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Filtrelenen işlemler CSV olarak indirildi.')
  }
  const days = Array.from({ length: new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate() }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    return { day, amount: summarize(monthTransactions.filter(t => t.date.endsWith(`-${day}`))).expense }
  })
  const dailyMax = Math.max(...days.map(d => d.amount), 1)
  const title = navigation.find(n => n.id === view).label
  const goalCards = data.goals.length ? data.goals.map(goal => <GoalCard key={goal.id} goal={goal}
    onAdd={() => setModal({ type: 'goal', goal, direction: 'add' })}
    onWithdraw={() => setModal({ type: 'goal', goal, direction: 'withdraw' })}
    onEdit={() => setModal({ type: 'goal-edit', goal })}
    onDelete={() => setModal({ type: 'goal-delete', goal })} />) : <div className="fin-panel fin-empty fin-goals-empty"><Target size={30} /><h3>Henüz hedef eklenmemiş</h3><p>Bir hedef oluşturup birikiminizi takip edin.</p><button className="fin-button" onClick={() => setModal({ type: 'goal-new' })}><Plus size={15} />Hedef ekle</button></div>
  const saveGoal = goal => commit(d => ({ ...d, goals: d.goals.some(g => g.id === goal.id) ? d.goals.map(g => g.id === goal.id ? goal : g) : [...d.goals, goal] }), 'Hedef kaydedildi.')
  const saveInvestment = position => commit(d => ({ ...d, investments: d.investments.some(p => p.id === position.id) ? d.investments.map(p => p.id === position.id ? position : p) : [...d.investments, position] }), 'Yatırım kaydedildi.')
  const modalTitles = { 'account': 'Hesabı düzenle', 'bill-new': 'Ödeme ekle', 'goal-new': 'Hedef ekle', 'goal-edit': 'Hedefi düzenle', 'goal-delete': 'Hedefi sil', goal: 'Birikimi düzenle', 'investment-new': 'Varlık ekle', 'investment-edit': 'Varlığı düzenle', 'investment-delete': 'Yatırım kaydını kaldır', 'investment-trade': 'Alım / satış ekle', 'investment-prices': 'Fiyatları güncelle', 'investment-history': 'Geçmiş değer ekle' }

  if (!workspace.ready || loading) return <div className="finance-app admin-theme fin-connection-page"><AdminAtmosphere /><section className="fin-panel fin-connection-card"><ShieldCheck size={30} /><h1>{loading ? 'Finans verileri yükleniyor' : 'Finans alanını etkinleştirelim'}</h1><p role={error ? 'alert' : 'status'}>{loading ? 'Kişisel kayıtlarınız Supabase’den alınıyor…' : error?.message}</p>{!loading && <button className="fin-button" onClick={reload}>Bağlantıyı yeniden kontrol et</button>}<Link to="/admin">Admin paneline dön</Link></section></div>

  return <div className="finance-app admin-theme">
    <title>Finans | MHL</title>
    <AdminAtmosphere /><a className="fin-skip" href="#finance-content">İçeriğe geç</a>
    <aside className="fin-sidebar" aria-label="Finans menüsü"><Link to="/finance" className="fin-brand"><Logo /><span>FİNANS</span></Link><p className="fin-nav-label">KİŞİSEL FİNANS</p><nav>{navigation.map(({ id, label, icon }) => <button className={`fin-nav-link ${view === id ? 'active' : ''}`} aria-label={label} aria-current={view === id ? 'page' : undefined} onClick={() => changeView(id)} key={id}>{createElement(icon, { size: 19 })}<span>{label}</span>{view === id && <i />}</button>)}</nav><div className="fin-sidebar-bottom"><div className="fin-demo-note"><span className="fin-demo-dot" /><strong>{demo ? 'Demo çalışma alanı' : 'Kişisel çalışma alanı'}</strong><p>{demo ? 'Örnek verilerle keşfedin.' : 'Yalnızca sizin hesabınıza bağlı.'}</p></div><Link to="/admin" className="fin-back-link"><ArrowLeft size={16} />Admin paneline dön</Link>{demo && <button className="fin-reset" onClick={() => setModal({ type: 'reset' })}><RotateCcw size={13} />Örnek verileri sıfırla</button>}</div></aside>
    <div className="fin-main"><header className="fin-topbar"><div className="fin-breadcrumb"><Link to="/admin">Çalışma alanı</Link><ChevronRight size={12} /><span>Finans</span></div><div><span className={`fin-demo-badge ${error ? 'is-error' : ''}`} role="status" title={workspace.updatedAt ? `Son kayıt: ${new Date(workspace.updatedAt).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}` : undefined}><i />{saving ? 'Kaydediliyor…' : error ? 'Kayıt doğrulanamadı' : demo ? 'Yerel demo' : 'Supabase’e kayıtlı'}</span><AdminThemeToggle /></div></header>
      <main id="finance-content" tabIndex={-1}>
      {error && <div className="fin-sync-error" role="alert"><p>{error.message}</p><p>Sunucu kaydını yüklemek açık formdaki değişiklikleri bırakır.</p><button className="fin-button secondary" onClick={reload}>Sunucu kaydını yükle</button></div>}
      <fieldset className="fin-data-controls" disabled={saving}><div className="fin-page-heading"><div><p className="fin-eyebrow">KİŞİSEL FİNANS</p><h1>{title}</h1></div><div className="fin-page-actions">{!['goals', 'investments'].includes(view) && <label className="fin-month-select"><CalendarDays size={15} /><span className="fin-sr-only">Dönem</span><select aria-label="Dönem" value={month} onChange={event => setMonth(event.target.value)}>{[...availableMonths].reverse().map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}</select></label>}{view !== 'transactions' && <button className="fin-button" onClick={() => setModal({ type: view === 'goals' ? 'goal-new' : view === 'investments' ? 'investment-new' : 'transaction' })}><Plus size={17} /><span>{view === 'goals' ? 'Hedef ekle' : view === 'investments' ? 'Varlık ekle' : 'İşlem ekle'}</span></button>}</div></div>

      {view === 'overview' && <>
        <section className="fin-stats" aria-label="Finans özeti">{[
          { label: 'Toplam bakiye', value: balance, icon: Wallet, hint: 'Tüm hesaplar · dönem sonu', values: availableMonths.map(m => accounts.reduce((sum, a) => sum + accountBalance(a, data.transactions, m), 0)), color: 'teal' },
          { label: 'Dönem geliri', value: totals.income, icon: ArrowDownLeft, hint: `${monthTransactions.filter(t => t.type === 'income').length} gelir işlemi`, values: monthly.map(m => m.income), color: 'teal' },
          { label: 'Dönem gideri', value: totals.expense, icon: ArrowUpRight, hint: `${monthTransactions.filter(t => t.type === 'expense').length} gider işlemi`, values: monthly.map(m => m.expense), color: 'lilac' },
          { label: 'Net birikim', value: totals.net, icon: Target, hint: `${percent(totals.rate)} tasarruf oranı`, values: monthly.map(m => m.net), color: 'peach' }
        ].map(stat => <article className={`fin-stat ${stat.color}`} key={stat.label}><div><span>{stat.label}</span>{createElement(stat.icon, { size: 17 })}</div><strong>{money(stat.value)}</strong><footer><span>{stat.hint}</span><Sparkline values={stat.values.slice(0, availableMonths.indexOf(month) + 1)} color={`var(--fin-${stat.color})`} /></footer></article>)}</section>
        <div className="fin-grid-main"><CashFlow transactions={data.transactions} month={month} baseMonths={demo ? months : []} /><Spending transactions={monthTransactions} onCategory={cat => changeView('transactions', cat)} /></div>
        <div className="fin-grid-secondary"><Panel title="Bütçe özeti" detail={`${money(totals.expense)} / ${money(budgetTotal)} kullanıldı`} action={<button className="fin-text-button" onClick={() => changeView('budgets')}>Tümü <ArrowUpRight size={14} /></button>}><div className="fin-budget-summary">{spending.slice(0, 4).map(c => <button key={c.id} onClick={() => setModal({ type: 'budget', category: c })}><div><span><i style={{ background: c.color }} />{c.label}</span><strong>{money(c.amount)} <small>/ {money(data.budgets[c.id])}</small></strong></div><div className="fin-progress"><i style={{ width: `${Math.min((data.budgets[c.id] ? c.amount / data.budgets[c.id] * 100 : 0), 100)}%`, background: data.budgets[c.id] > 0 && c.amount > data.budgets[c.id] ? 'var(--admin-danger)' : c.color }} /></div></button>)}</div></Panel><Panel title="Yaklaşan ödemeler" detail={monthLabel(month)} action={<button className="fin-text-button" onClick={() => setModal({ type: 'bill-new' })}><Plus size={14} />Ödeme ekle</button>}><div className="fin-bills">{!data.bills.some(bill => bill.date.startsWith(month)) && <p className="fin-context-note">Bu dönem için planlanmış ödeme yok.</p>}{data.bills.filter(bill => bill.date.startsWith(month)).map(bill => <div key={bill.id}><span className="fin-bill-date"><strong>{bill.date.slice(-2)}</strong>{monthLabel(bill.date.slice(0, 7), true)}</span><div><strong>{bill.name}</strong><small>{money(bill.amount)}</small></div><button className={bill.paid ? 'is-paid' : ''} disabled={bill.paid} onClick={() => payBill(bill)}>{bill.paid ? <><Check size={13} />Ödendi</> : 'Ödendi işaretle'}</button></div>)}</div></Panel></div>
        <Panel title="Son işlemler" detail={monthLabel(month)} action={<button className="fin-text-button" onClick={() => changeView('transactions')}>Tüm işlemler <ArrowUpRight size={14} /></button>} className="fin-recent"><TransactionList accounts={accounts} transactions={monthTransactions.slice(0, 5)} onSelect={transaction => setModal({ type: 'detail', transaction })} compact /></Panel>
        <div className="fin-section-heading"><h2>Birikim hedefleri</h2><button className="fin-text-button" onClick={() => changeView('goals')}>Tümü <ArrowUpRight size={14} /></button></div><div className="fin-goal-grid">{goalCards}</div>
      </>}

      {view === 'transactions' && <><Panel title="İşlem ekle" className="fin-transaction-entry"><TransactionForm key={`${month}-${reloadKey}`} month={month} accounts={accounts} demo={demo} inline onSave={saveTransaction} /></Panel><StatementImport accounts={accounts} cloud={!demo} transactions={data.transactions} imports={data.statementImports} onImport={(transactions, batch) => commit(d => ({ ...d, transactions: [...d.transactions, ...transactions], statementImports: [...(d.statementImports || []), batch] }), `${transactions.length} işlem içe aktarıldı.`, () => {
        setMonth(transactions.map(t => t.date.slice(0, 7)).sort().at(-1)); setQuery(''); setType('all'); setCategory('all'); setAccount('all')
      })} onUndo={id => commit(d => ({ ...d, transactions: d.transactions.filter(t => t.importBatch !== id), statementImports: (d.statementImports || []).filter(batch => batch.id !== id) }), 'Ekstre aktarımı geri alındı.')} /><div className="fin-transaction-summary"><span>{filtered.length} işlem</span><span>Gelir <strong className="fin-positive">+{money(filteredTotals.income)}</strong></span><span>Gider <strong>−{money(filteredTotals.expense)}</strong></span><span>Net <strong>{money(filteredTotals.net)}</strong></span></div><Panel title="İşlem geçmişi" action={<button className="fin-text-button" onClick={exportCSV}><Download size={15} />CSV indir</button>}><div className="fin-filters"><label className="fin-search"><Search size={16} /><input aria-label="İşlem ara" placeholder="İşlem ara…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button onClick={() => setQuery('')} aria-label="Aramayı temizle"><X size={14} /></button>}</label><select aria-label="İşlem türü" value={type} onChange={event => setType(event.target.value)}><option value="all">Tüm işlemler</option><option value="income">Gelir</option><option value="expense">Gider</option></select><select aria-label="Kategori filtresi" value={category} onChange={event => setCategory(event.target.value)}><option value="all">Tüm kategoriler</option>{categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select><select aria-label="Hesap filtresi" value={account} onChange={event => setAccount(event.target.value)}><option value="all">Tüm hesaplar</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>{(query || type !== 'all' || category !== 'all' || account !== 'all') && <button className="fin-text-button" onClick={() => { setQuery(''); setType('all'); setCategory('all'); setAccount('all') }}>Temizle</button>}</div><TransactionList accounts={accounts} transactions={filtered} onSelect={transaction => setModal({ type: 'detail', transaction })} /><div className="fin-table-footer">{monthLabel(month)}<span>{filtered.length} işlem gösteriliyor</span></div></Panel></>}

      {view === 'budgets' && <><div className="fin-budget-banner fin-panel"><div><span>Aylık toplam bütçe</span><strong>{money(budgetTotal)}</strong></div><div><span>Harcanan</span><strong>{money(totals.expense)}</strong></div><div><span>Kalan bütçe</span><strong className={budgetTotal < totals.expense ? 'fin-negative' : 'fin-positive'}>{money(budgetTotal - totals.expense)}</strong></div><div className="fin-budget-ring" style={{ '--usage': `${Math.min((budgetTotal ? totals.expense / budgetTotal * 100 : 0), 100)}%` }}><span>{percent((budgetTotal ? totals.expense / budgetTotal * 100 : 0))}<small>kullanıldı</small></span></div></div><p className="fin-context-note">Bütçe limitleri tüm dönemlerde geçerlidir. Düzenlemek için kategori ayarını açın.</p><div className="fin-budget-grid">{spending.map(c => <BudgetCard key={c.id} category={c} amount={c.amount} limit={data.budgets[c.id]} onEdit={() => setModal({ type: 'budget', category: c })} />)}</div><Panel title="Günlük harcama" detail={monthLabel(month)} className="fin-daily"><div className="fin-daily-bars">{days.map(({ day, amount: value }, index) => {
        return <button key={day} style={{ '--bar': `${value ? Math.max(5, value / dailyMax * 100) : 0}%` }} title={`${day} ${monthLabel(month)}: ${money(value)}`} onClick={() => setModal({ type: 'day', day, transactions: monthTransactions.filter(t => t.date.endsWith(`-${day}`)) })}><span><i /></span><small>{index % 5 === 0 ? day : '·'}</small><span className="fin-sr-only">{day} {monthLabel(month)}: {money(value)}</span></button>
      })}</div></Panel></>}

      {view === 'accounts' && <><section className="fin-account-overview fin-panel"><div><span>Tüm hesapların toplamı</span><h2>{money(balance, 2)}</h2><p>{monthLabel(month)} sonuna kadar olan işlemler</p></div><div className="fin-account-distribution"><div>{balances.map(a => <span key={a.id} className={a.color} style={{ width: `${Math.max(a.balance, 0) / (balances.reduce((sum, b) => sum + Math.max(b.balance, 0), 0) || 1) * 100}%` }} />)}</div><p>{balances.map(a => <span key={a.id}><i className={a.color} />{a.name}</span>)}</p></div></section><div className="fin-account-grid">{balances.map(a => <article className={`fin-account-card ${a.color}`} key={a.id}><header><span className="fin-account-symbol"><Landmark size={23} /></span><span>TRY</span></header><div><h2>{a.name}</h2><p>{a.institution}</p></div><strong>{money(a.balance, 2)}</strong><footer><button className="fin-icon-button" onClick={() => setModal({ type: 'account', account: a })} aria-label={`${a.name} hesabını düzenle`}><SlidersHorizontal size={16} /></button><span>{a.suffix ? `•••• ${a.suffix}` : a.id === 'cash' ? 'Nakit bakiye' : 'TL hesabı'}</span><button onClick={() => changeView('transactions', 'all', a.id)} aria-label={`${a.name} işlemleri`}><ArrowUpRight size={19} /></button></footer></article>)}</div><div className="fin-grid-main"><CashFlow transactions={data.transactions} month={month} baseMonths={demo ? months : []} /><Panel title="Hesap hareketleri" detail={monthLabel(month)}><div className="fin-account-activity">{accounts.map(a => {
        const summary = summarize(monthTransactions.filter(t => t.account === a.id))
        return <div key={a.id}><strong>{a.name}</strong><p><span>Giriş</span><span className="fin-positive">+{money(summary.income)}</span></p><p><span>Çıkış</span><span>−{money(summary.expense)}</span></p><div className="fin-progress"><i style={{ width: `${summary.income + summary.expense ? summary.income / (summary.income + summary.expense) * 100 : 0}%` }} /></div></div>
      })}</div></Panel></div><p className="fin-context-note"><ShieldCheck size={15} />Bakiyeler kayıtlı işlemlerden hesaplanır. Banka hesabına otomatik bağlantı kullanılmaz.</p></>}

      {view === 'investments' && <Investments history={data.investmentHistory} positions={data.investments} realizedGain={data.realizedInvestmentGain || 0} onAction={setModal} />}
      {view === 'goals' && <><div className="fin-goals-summary fin-panel"><div><Target size={25} /><span>Hedeflere ayrılan birikim</span><strong>{goalMoney(data.goals.reduce((sum, g) => sum + g.saved, 0))}</strong></div><div><span>Toplam hedef</span><strong>{goalMoney(data.goals.reduce((sum, g) => sum + g.target, 0))}</strong></div><div><span>Aktif hedefler</span><strong>{data.goals.filter(g => g.saved < g.target).length} <small>/ {data.goals.length}</small></strong></div></div><div className="fin-goal-grid">{goalCards}</div><p className="fin-context-note">Hedefler, mevcut bakiyenin nasıl ayrıldığını gösterir. Birikim eklemek veya çıkarmak hesap bakiyesini değiştirmez.</p></>}

      </fieldset></main><footer className="fin-footer"><span>© {new Date().getFullYear()} MHL <i />Finans</span><span>Tüm tutarlar TRY · {demo ? 'Yerel demo' : 'Kişisel Supabase alanı'}</span>{demo && <button className="fin-mobile-reset" onClick={() => setModal({ type: 'reset' })}><RotateCcw size={11} />Örnek verileri sıfırla</button>}</footer></div>
    <LiquidGlassNav label="Finans alt menüsü" variant="finance" activeId={view} items={navigation.map(item => ({ ...item, onClick: () => changeView(item.id) }))} />
    {notice && <div className="fin-toast" role="status"><Check size={17} />{notice}</div>}
    {modal && <Modal title={modalTitles[modal.type] || (modal.type === 'transaction' ? 'İşlem ekle' : modal.type === 'budget' ? `${modal.category.label} bütçesi` : modal.type === 'goal' ? 'Birikim ekle' : modal.type === 'detail' ? 'İşlem ayrıntısı' : modal.type === 'day' ? `${modal.day} ${monthLabel(month)}` : 'Örnek verileri sıfırla')} onClose={closeModal}>
      {error && <p className="fin-form-error" role="alert">{error.message}</p>}
      <fieldset className="fin-data-controls" disabled={saving}>
      {modal.type === 'transaction' && <TransactionForm month={month} accounts={accounts} demo={demo} onSave={saveTransaction} onClose={closeModal} />}
      {modal.type === 'budget' && <form className="fin-form" onSubmit={event => { event.preventDefault(); const limit = Number(new FormData(event.currentTarget).get('limit')); if (Number.isFinite(limit) && limit >= 0) void commit(d => ({ ...d, budgets: { ...d.budgets, [modal.category.id]: limit } }), 'Bütçe limiti güncellendi.') }}><p>Kategori için aylık harcama limiti belirleyin.</p><label>Aylık limit (₺)<input name="limit" type="number" min="0" max="10000000" step="1" defaultValue={data.budgets[modal.category.id]} required /></label><div className="fin-form-actions"><button type="button" className="fin-button secondary" onClick={closeModal}>Vazgeç</button><button className="fin-button" type="submit">Kaydet</button></div></form>}
      {['goal-new', 'goal-edit'].includes(modal.type) && <GoalForm goal={modal.goal} onSave={saveGoal} onClose={closeModal} />}
      {modal.type === 'goal' && <GoalAdjustmentForm goal={modal.goal} direction={modal.direction} onSave={saveGoal} onClose={closeModal} />}
      {modal.type === 'goal-delete' && <div className="fin-form"><p><strong>{modal.goal.name}</strong> hedefi silinecek. Hedefe ayrılan birikim kaldırılır; hesap bakiyeleri değişmez.</p><div className="fin-form-actions"><button className="fin-button secondary" onClick={closeModal}>Vazgeç</button><button className="fin-button fin-danger-button" onClick={() => commit(d => ({ ...d, goals: d.goals.filter(g => g.id !== modal.goal.id) }), 'Hedef silindi.')}>Hedefi sil</button></div></div>}
      {['investment-new', 'investment-edit'].includes(modal.type) && <InvestmentForm position={modal.position} onSave={saveInvestment} onClose={closeModal} />}
      {modal.type === 'investment-trade' && <InvestmentTradeForm position={modal.position} onClose={closeModal} onSave={(result, direction) => commit(d => ({ ...d, investments: result.position.quantity ? d.investments.map(p => p.id === result.position.id ? result.position : p) : d.investments.filter(p => p.id !== result.position.id), realizedInvestmentGain: (d.realizedInvestmentGain || 0) + result.realizedGain }), direction === 'sell' ? `Satış kaydedildi. Gerçekleşen kâr/zarar: ${money(result.realizedGain, 2)}` : 'Alım kaydedildi; ortalama maliyet güncellendi.')} />}
      {modal.type === 'investment-prices' && <InvestmentPricesForm positions={modal.position ? [modal.position] : data.investments} onClose={closeModal} onSave={(prices, priceDate) => { const positions = updateInvestmentPrices(data.investments, prices, priceDate); return commit(d => ({ ...d, investments: positions }), 'Değerleme fiyatları güncellendi.') }} />}
      {modal.type === 'investment-history' && <InvestmentHistoryForm positions={data.investments} onClose={closeModal} onSave={snapshot => commit(d => ({ ...d, investmentHistory: upsertInvestmentSnapshot(d.investmentHistory, snapshot) }), 'Geçmiş değer kaydedildi.')} />}
      {modal.type === 'investment-delete' && <div className="fin-form"><p><strong>{modal.position.symbol} · {modal.position.name}</strong> kaydı kaldırılacak. Bu işlem satış oluşturmaz ve satış kâr/zararını değiştirmez.</p><div className="fin-form-actions"><button className="fin-button secondary" onClick={closeModal}>Vazgeç</button><button className="fin-button fin-danger-button" onClick={() => commit(d => ({ ...d, investments: d.investments.filter(p => p.id !== modal.position.id) }), 'Yatırım kaydı kaldırıldı.')}>Kaydı kaldır</button></div></div>}

      {modal.type === 'detail' && <div className="fin-detail"><div className={`fin-detail-amount ${modal.transaction.type === 'income' ? 'fin-positive' : ''}`}>{modal.transaction.type === 'income' ? '+' : '−'}{money(modal.transaction.amount, 2)}</div><h3>{modal.transaction.title}</h3><dl>{[['Tarih', `${dateLabel(modal.transaction.date)} ${modal.transaction.date.slice(0, 4)}`], ['Tür', modal.transaction.type === 'income' ? 'Gelir' : 'Gider'], ['Kategori', categories.find(c => c.id === modal.transaction.category)?.label], ['Hesap', accounts.find(a => a.id === modal.transaction.account)?.name], ['Not', modal.transaction.note || 'Not eklenmemiş.']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button className="fin-button secondary" onClick={closeModal}>Kapat</button></div>}
      {modal.type === 'day' && <div className="fin-day-detail"><TransactionList accounts={accounts} transactions={modal.transactions} compact onSelect={transaction => setModal({ type: 'detail', transaction })} /></div>}
      {demo && modal.type === 'reset' && <div className="fin-form"><p>Eklediğiniz örnek işlemler, bütçe değişiklikleri, hedefler, yatırım, geçmiş değer ve ekstreyle eklenen işlem kayıtları başlangıç değerlerine dönecek.</p><div className="fin-form-actions"><button className="fin-button secondary" onClick={closeModal}>Vazgeç</button><button className="fin-button" onClick={() => commit(createFinanceDemo(), 'Örnek veriler sıfırlandı.', () => { setMonth(DEMO_MONTH); closeModal() })}>Sıfırla</button></div></div>}
      {modal.type === 'account' && <AccountForm account={modal.account} onClose={closeModal} onSave={account => commit(d => ({ ...d, accounts: accounts.map(item => item.id === account.id ? account : item) }), 'Hesap kaydedildi.')} />}
      {modal.type === 'bill-new' && <BillForm accounts={accounts} onClose={closeModal} onSave={bill => commit(d => ({ ...d, bills: [...d.bills, bill] }), 'Ödeme planına eklendi.', () => { setMonth(bill.date.slice(0, 7)); closeModal() })} />}
      </fieldset>
    </Modal>}
  </div>
}
