import { useState } from 'react'
import { Plus, ArrowLeftRight, SlidersHorizontal, Trash2, RefreshCw, ChartNoAxesCombined } from 'lucide-react'
import { money } from '../../lib/financeDemo'
import { investmentMetrics, investmentSummary, investmentTypes } from '../../lib/financePortfolio'
import InvestmentHistory from './InvestmentHistory'

const quantity = value => value.toLocaleString('tr-TR', { maximumFractionDigits: 8 })
const rate = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}%${Math.abs(value).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`
const signedMoney = value => `${value > 0 ? '+' : ''}${money(value, 2)}`
const tone = value => value < 0 ? 'fin-negative' : value > 0 ? 'fin-positive' : ''
const fullDate = value => new Date(`${value}T12:00:00`).toLocaleDateString('tr-TR')

export default function Investments({ positions, history = [], realizedGain = 0, onAction }) {
  const [filter, setFilter] = useState('all'), [selectedId, setSelectedId] = useState(null)
  const totals = investmentSummary(positions)
  const filtered = positions.filter(p => filter === 'all' || (filter === 'bist' ? p.kind === 'bist' : p.kind !== 'bist'))
  const selected = filtered.find(p => p.id === selectedId) || filtered[0]
  const selectedMetrics = selected && investmentMetrics(selected)
  const groups = [
    { id: 'bist', label: 'BIST', color: 'var(--fin-lilac)', value: investmentSummary(positions.filter(p => p.kind === 'bist')).value },
    { id: 'gold', label: 'Altın', color: 'var(--fin-gold)', value: investmentSummary(positions.filter(p => p.kind !== 'bist')).value }
  ]
  const bistShare = totals.value ? groups[0].value / totals.value * 100 : 0
  const chartMax = Math.max(...filtered.flatMap(p => { const m = investmentMetrics(p); return [m.cost, m.value] }), 1)
  return <>
    <div className="fin-investment-source"><span><i />Elle fiyat girişi</span><p>{positions.some(position => position.source === 'demo') ? 'Başlangıç fiyatları temsili örnektir. Canlı veri bağlantısı yoktur; kendi fiyatlarınızı güncelleyebilirsiniz.' : 'Değerleme, girdiğiniz birim fiyat ve tarihe göre hesaplanır. Güncel fiyatlarınızı elle kaydedebilirsiniz.'}</p><button className="fin-text-button" disabled={!positions.length} onClick={() => onAction({ type: 'investment-prices' })}><RefreshCw size={14} />Fiyatları güncelle</button></div>
    <section className="fin-stats fin-investment-stats" aria-label="Yatırım özeti">{[
      { label: 'Portföy değeri', value: money(totals.value, 2), hint: `${positions.length} açık pozisyon` },
      { label: 'Toplam alış maliyeti', value: money(totals.cost, 2), hint: 'Açık pozisyonların maliyeti' },
      { label: 'Açık pozisyon kâr/zararı', value: signedMoney(totals.gain), hint: rate(totals.rate), tone: tone(totals.gain) },
      { label: 'Satış kâr/zararı', value: signedMoney(realizedGain), hint: 'Kaydedilen satışlardan', tone: tone(realizedGain) }
    ].map(stat => <article className="fin-stat" key={stat.label}><div><span>{stat.label}</span></div><strong className={stat.tone}>{stat.value}</strong><footer><span className={stat.tone}>{stat.hint}</span></footer></article>)}</section>
    <InvestmentHistory history={history} onAdd={() => onAction({ type: 'investment-history' })} />
    {positions.length ? <>
      <div className="fin-grid-main fin-investment-charts"><section className="fin-panel"><div className="fin-panel-heading"><div><h2>Maliyet ve değer</h2><p>Alış maliyeti ile son fiyatlara göre değerleme</p></div><div className="fin-investment-legend"><span><i />Maliyet</span><span><i />Değer</span></div></div><div className="fin-investment-readout" aria-live="polite">{selected && <><strong>{selected.symbol}</strong><span>Maliyet {money(selectedMetrics.cost, 2)}</span><span>Değer {money(selectedMetrics.value, 2)}</span><span className={tone(selectedMetrics.gain)}>{rate(selectedMetrics.rate)}</span></>}</div><div className="fin-investment-bars">{filtered.map(position => {
        const metrics = investmentMetrics(position)
        return <button key={position.id} aria-pressed={position.id === selected?.id} aria-label={`${position.symbol}: maliyet ${money(metrics.cost, 2)}, değer ${money(metrics.value, 2)}`} onMouseEnter={() => setSelectedId(position.id)} onFocus={() => setSelectedId(position.id)} onClick={() => setSelectedId(position.id)}><span>{position.symbol}</span><div><i style={{ width: `${metrics.cost / chartMax * 100}%` }} /><i style={{ width: `${metrics.value / chartMax * 100}%`, background: position.kind === 'bist' ? 'var(--fin-lilac)' : 'var(--fin-gold)' }} /></div><strong>{money(metrics.value)}</strong></button>
      })}{!filtered.length && <p className="fin-context-note">Bu grupta açık pozisyon yok.</p>}</div></section>
      <section className="fin-panel"><div className="fin-panel-heading"><div><h2>Varlık dağılımı</h2><p>Tüm açık pozisyonların değerine göre</p></div></div><div className="fin-allocation-ring" style={{ '--bist-share': `${bistShare}%` }} role="img" aria-label={`BIST yüzde ${bistShare.toFixed(1)}, altın yüzde ${(totals.value ? 100 - bistShare : 0).toFixed(1)}`}><div><span>Toplam değer</span><strong>{money(totals.value)}</strong><small>{positions.length} varlık</small></div></div><div className="fin-allocation-labels">{groups.map(group => <button key={group.id} aria-pressed={filter === group.id} onClick={() => setFilter(f => f === group.id ? 'all' : group.id)}><span><i style={{ background: group.color }} />{group.label}</span><strong>{money(group.value, 2)}</strong><small>%{(totals.value ? group.value / totals.value * 100 : 0).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}</small></button>)}</div></section></div>
      <section className="fin-panel"><div className="fin-panel-heading"><div><h2>Yatırımlarım</h2><p>Kâr/zarar hesabı komisyon ve vergileri içermez.</p></div><div className="fin-segment" aria-label="Yatırım türü filtresi">{[['all', 'Tümü'], ['bist', 'BIST'], ['gold', 'Altın']].map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div></div>
        <div className="fin-table-scroll"><table className="fin-transactions fin-investment-table"><thead><tr><th>Varlık</th><th>Miktar</th><th>Ort. maliyet</th><th>Son fiyat</th><th>Değer</th><th>Kâr / zarar</th><th>İşlemler</th></tr></thead><tbody>{filtered.map(position => {
          const metrics = investmentMetrics(position), type = investmentTypes.find(t => t.id === position.kind)
          return <tr key={position.id}><td><div className="fin-investment-name"><span className={position.kind === 'bist' ? 'lilac' : 'gold'}>{position.kind === 'bist' ? position.symbol.slice(0, 2) : 'Au'}</span><div><strong>{position.symbol}</strong><small>{position.name}</small></div></div></td><td>{quantity(position.quantity)} <small>{type?.unit}</small></td><td>{money(position.averageCost, 2)}</td><td><button className="fin-quote-button" aria-label={`${position.symbol} fiyatını güncelle`} onClick={() => onAction({ type: 'investment-prices', position })}><strong>{money(position.price, 2)}</strong><RefreshCw size={11} /></button><small className="fin-quote-date">{fullDate(position.priceDate)} · {position.source === 'demo' ? 'Örnek fiyat' : 'Elle girildi'}</small></td><td className="fin-investment-value">{money(metrics.value, 2)}</td><td className={tone(metrics.gain)}><strong>{signedMoney(metrics.gain)}</strong><small className="fin-quote-date">{rate(metrics.rate)}</small></td><td><div className="fin-row-actions"><button className="fin-icon-button" onClick={() => onAction({ type: 'investment-trade', position })} aria-label={`${position.symbol} alım veya satış ekle`} title="Alım / satış ekle"><ArrowLeftRight size={15} /></button><button className="fin-icon-button" onClick={() => onAction({ type: 'investment-edit', position })} aria-label={`${position.symbol} düzenle`} title="Düzenle"><SlidersHorizontal size={15} /></button><button className="fin-icon-button fin-delete-action" onClick={() => onAction({ type: 'investment-delete', position })} aria-label={`${position.symbol} kaydını kaldır`} title="Kaydı kaldır"><Trash2 size={15} /></button></div></td></tr>
        })}</tbody></table></div>{!filtered.length && <div className="fin-empty"><p>Bu grupta açık pozisyon yok.</p><button className="fin-text-button" onClick={() => setFilter('all')}>Tümünü göster</button></div>}
      </section><p className="fin-context-note fin-investment-footnote">Yatırımlar ayrı takip edilir; alım, satış ve değerleme değişiklikleri nakit hesaplarına otomatik işlenmez.</p>
    </> : <div className="fin-panel fin-empty"><ChartNoAxesCombined size={32} /><h3>Henüz yatırım eklenmemiş</h3><p>BIST hisselerinizi ve altın birikiminizi ekleyebilirsiniz.</p><button className="fin-button" onClick={() => onAction({ type: 'investment-new' })}><Plus size={15} />Varlık ekle</button></div>}
  </>
}
