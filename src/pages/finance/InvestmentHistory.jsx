import { useId, useState } from 'react'
import { Plus, ChartNoAxesCombined } from 'lucide-react'
import { money } from '../../lib/financeDemo'
import { investmentHistorySeries } from '../../lib/financePortfolio'

const dayLabel = (date, short = false) => new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { day: 'numeric', month: short ? 'short' : 'long', ...(short ? {} : { year: 'numeric' }) })

export default function InvestmentHistory({ history, onAdd }) {
  const [period, setPeriod] = useState('6'), [group, setGroup] = useState('all'), [activeDate, setActiveDate] = useState(null)
  const gradientId = useId().replaceAll(':', '')
  const series = investmentHistorySeries(history, group, period)
  const selectedIndex = Math.max(0, series.findIndex(point => point.date === activeDate) < 0 ? series.length - 1 : series.findIndex(point => point.date === activeDate))
  const selected = series[selectedIndex]
  const color = group === 'gold' ? 'var(--fin-gold)' : group === 'bist' ? 'var(--fin-lilac)' : 'var(--accent-deep)'
  const first = series[0], last = series.at(-1), change = last ? last.value - first.value : 0
  const max = Math.max(...series.flatMap(point => [point.cost, point.value]), 1) * 1.15
  const startTime = first ? Date.parse(first.date) : 0, duration = last ? Date.parse(last.date) - startTime : 0
  const x = point => duration ? 10 + (Date.parse(point.date) - startTime) / duration * 880 : 450
  const y = value => 210 - value / max * 190
  const labels = []
  series.forEach((point, index) => {
    if (index === series.length - 1 && labels.length > 1 && x(point) - x(series[labels.at(-1)]) < 200) labels.pop()
    if (!labels.length || x(point) - x(series[labels.at(-1)]) >= 200) labels.push(index)
  })
  return <section className="fin-panel fin-history" aria-label="Portföy değer geçmişi">
    <div className="fin-panel-heading"><div><h2>Portföy değer geçmişi</h2><p>Tarihli değerleme kayıtlarına göre değişim</p></div><button className="fin-text-button" onClick={onAdd}><Plus size={14} />Geçmiş değer ekle</button></div>
    <div className="fin-history-controls"><div className="fin-segment" role="group" aria-label="Grafik varlık grubu">{[['all', 'Toplam'], ['bist', 'BIST'], ['gold', 'Altın']].map(([value, label]) => <button key={value} aria-pressed={group === value} onClick={() => { setGroup(value); setActiveDate(null) }}>{label}</button>)}</div><div className="fin-segment" role="group" aria-label="Yatırım grafiği dönemi">{[['1', '1 ay'], ['3', '3 ay'], ['6', '6 ay'], ['all', 'Tümü']].map(([value, label]) => <button key={value} aria-pressed={period === value} onClick={() => { setPeriod(value); setActiveDate(null) }}>{label}</button>)}</div></div>
    {selected ? <>
      <div className="fin-history-readout" aria-live="polite"><div><span>{dayLabel(selected.date)}<small>{selected.source === 'demo' ? 'Örnek geçmiş' : selected.source === 'manual' ? 'Elle eklenen kayıt' : 'Kaydedilen değer'}</small></span><strong>{money(selected.value, 2)}</strong><p>Alış maliyeti <b>{money(selected.cost, 2)}</b></p></div><div className="fin-history-change"><span>Dönemdeki değer değişimi</span><strong className={change < 0 ? 'fin-negative' : change > 0 ? 'fin-positive' : ''}>{change > 0 ? '+' : ''}{money(change, 2)}</strong><p>{dayLabel(first.date, true)} – {dayLabel(last.date, true)}</p></div></div>
      <div className="fin-history-legend"><span><i style={{ background: color }} />Portföy değeri</span><span><i />Alış maliyeti</span></div>
      <div className="fin-history-plot"><div className="fin-history-y-axis" aria-hidden="true">{[1, .75, .5, .25, 0].map(ratio => <span key={ratio}>{new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 0 }).format(max * ratio)}</span>)}</div><svg viewBox="0 0 900 220" preserveAspectRatio="none" role="img" aria-label={`${dayLabel(selected.date)}: portföy değeri ${money(selected.value, 2)}, alış maliyeti ${money(selected.cost, 2)}`}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".24" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" x2="900" y1={20 + i * 47.5} y2={20 + i * 47.5} stroke="var(--line)" strokeDasharray="3 6" vectorEffect="non-scaling-stroke" />)}
        {series.length > 1 && <><polygon points={`${x(first)},210 ${series.map(point => `${x(point)},${y(point.value)}`).join(' ')} ${x(last)},210`} fill={`url(#${gradientId})`} /><polyline points={series.map(point => `${x(point)},${y(point.cost)}`).join(' ')} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" /><polyline points={series.map(point => `${x(point)},${y(point.value)}`).join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></>}
        <line x1={x(selected)} x2={x(selected)} y1="10" y2="210" stroke="var(--line-strong)" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
        {series.map(point => <g key={point.date} onMouseEnter={() => setActiveDate(point.date)} onClick={() => setActiveDate(point.date)}><circle cx={x(point)} cy={y(point.value)} r={point.date === selected.date ? 4.5 : 3} fill={color} /><rect x={x(point) - 10} y="0" width="20" height="220" fill="transparent" /></g>)}
      </svg></div>
      <div className="fin-history-x-axis" aria-hidden="true">{labels.map(index => <span key={series[index].date} style={{ left: `${x(series[index]) / 900 * 100}%` }}>{dayLabel(series[index].date, true)}</span>)}</div>
      <label className="fin-history-slider"><span className="fin-sr-only">Grafik tarihini seç</span><input type="range" aria-label="Grafik tarihini seç" aria-valuetext={`${dayLabel(selected.date)}: ${money(selected.value, 2)}`} min="0" max={Math.max(series.length - 1, 1)} value={selectedIndex} disabled={series.length < 2} onChange={event => setActiveDate(series[Number(event.target.value)].date)} /></label>
      {series.length === 1 && <p className="fin-context-note">Şimdilik tek kayıt var. Yeni değerlemeler geldikçe grafik oluşacak; geçmiş bir tarihin değerini de ekleyebilirsiniz.</p>}
      <p className="fin-history-note">Değer değişimi alım ve satışları da içerir; yatırım getirisi değildir. {series.some(point => point.source === 'demo') ? 'Örnek geçmiş noktaları temsili verilerdir. ' : ''}Aynı günün son değerlemesi saklanır.</p>
    </> : <div className="fin-empty"><ChartNoAxesCombined size={28} /><h3>Henüz geçmiş kaydı yok</h3><p>Bir yatırım veya fiyat güncellemesi kaydedin ya da geçmiş değer ekleyin.</p></div>}
  </section>
}
