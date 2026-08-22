import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { formatCurrency } from '../../utils.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Badge from '../../components/common/Badge.jsx'
import AgeIndicator from '../../components/common/AgeIndicator.jsx'

const TODAY = new Date('2026-08-22T12:00:00Z')

function ageDays(createdAt) {
  return Math.floor((TODAY - new Date(createdAt)) / (1000 * 60 * 60 * 24))
}

function KpiCard({ icon, value, label, sub, onClick, accent }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow var(--transition-fast)',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
    >
      <div style={{ fontSize: 24, marginBottom: 'var(--space-2)' }}>{icon}</div>
      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: accent ?? 'var(--navy)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginTop: 'var(--space-1)' }}>{label}</div>
      {sub && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardScreen() {
  const { state } = useAppState()
  const navigate = useNavigate()

  const fleet = useMemo(() => ({
    inYard:    state.equipment.filter(e => e.status === 'IN_YARD').length,
    onJob:     state.equipment.filter(e => e.status === 'ON_JOB').length,
    subRented: state.equipment.filter(e => e.status === 'SUB_RENTED').length,
    total:     state.equipment.length,
  }), [state.equipment])

  const exceptions = useMemo(() => ({
    open:     state.exceptions.filter(e => e.status === 'OPEN' && e.type !== 'ROUTING_COMPARISON').length,
    resolved: state.exceptions.filter(e => e.status === 'RESOLVED').length,
    highlights: state.exceptions.filter(e => e.type === 'ROUTING_COMPARISON').length,
  }), [state.exceptions])

  const invoiceAging = useMemo(() => {
    const openInvoices = state.invoices.filter(inv => inv.status !== 'POSTED')
    const buckets = { '0-30': [], '31-60': [], '60+': [] }
    openInvoices.forEach(inv => {
      const days = ageDays(inv.createdAt)
      if (days <= 30) buckets['0-30'].push(inv)
      else if (days <= 60) buckets['31-60'].push(inv)
      else buckets['60+'].push(inv)
    })
    return { buckets, total: openInvoices.length }
  }, [state.invoices])

  const openExceptionTickets = state.exceptions
    .filter(e => e.status === 'OPEN' && e.ticketId)
    .map(e => {
      const tkt = state.tickets.find(t => t.id === e.ticketId)
      const job = tkt ? state.jobs.find(j => j.id === tkt.jobId) : null
      return { exception: e, ticket: tkt, job }
    })
    .filter(x => x.ticket)

  return (
    <div>
      {/* ── Prominent sparse-data note — must be unmissable ── */}
      <div style={{
        background: 'var(--navy)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4) var(--space-5)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>📊</span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 'var(--text-base)', marginBottom: 6 }}>
            Prototype data — numbers are intentionally small
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            This prototype was built with 3–5 sample jobs. The KPIs below are functional but won't look statistically meaningful yet.
            {' '}<strong style={{ color: 'white' }}>Revenue by customer/job, billing error rate, and job/ticket throughput</strong> are noted
            as "coming in V1 with full data" — they require a complete historical data set to be useful.
          </div>
        </div>
      </div>

      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Snapshot — session data only</p>
      </div>

      {/* ── Fleet status ── */}
      <h3 className="section-title">Fleet Status</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <KpiCard icon="🏗️" value={fleet.inYard}    label="In Yard"    sub={`of ${fleet.total} total`}         accent="var(--status-approved)" onClick={() => navigate('/alya/fleet')} />
        <KpiCard icon="🔧" value={fleet.onJob}     label="On Job"     sub="actively deployed"                  accent="var(--accent-dark)"     onClick={() => navigate('/alya/fleet')} />
        <KpiCard icon="🔄" value={fleet.subRented} label="Sub-Rented" sub="with external operators"            accent="#6a1b9a"                 onClick={() => navigate('/alya/fleet')} />
      </div>

      {/* ── Exception queue ── */}
      <h3 className="section-title">Exception Queue</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <KpiCard icon="🚨" value={exceptions.open}       label="Open Exceptions"   sub="require action"                   accent="var(--status-flagged)" onClick={() => navigate('/alya/exceptions')} />
        <KpiCard icon="🗺️" value={exceptions.highlights} label="Demo Highlights"   sub="routing + capability proofs"      accent="var(--navy-light)"     onClick={() => navigate('/alya/exceptions')} />
      </div>

      {/* Active exception tickets inline */}
      {openExceptionTickets.length > 0 && (
        <Card style={{ marginBottom: 'var(--space-6)' }}>
          <CardHeader title="Open Exception Details" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {openExceptionTickets.map(({ exception, ticket, job }) => {
              const typeMap = {
                DOUBLE_BOOKING: { icon: '🔄', label: 'Double-Booking' },
                SELF_MOVE_FLAGGED: { icon: '🚩', label: 'Rig Self-Move' },
                PAST_SLA: { icon: '⏱️', label: 'Past SLA' },
              }
              const meta = typeMap[exception.type] ?? { icon: '⚠️', label: exception.type }
              return (
                <div key={exception.id} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{meta.label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {ticket.id} · {job?.wellName} · {job?.region}
                    </div>
                  </div>
                  {exception.amount && (
                    <span style={{ fontWeight: 700, color: 'var(--status-flagged)' }}>
                      {formatCurrency(exception.amount)}
                    </span>
                  )}
                  {exception.daysOpen && <AgeIndicator daysOpen={exception.daysOpen} />}
                  <Badge status="OPEN" label="Open" />
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alya/exceptions')}>
                    View →
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── Invoice aging ── */}
      <h3 className="section-title">Open Invoice Aging</h3>
      <Card style={{ marginBottom: 'var(--space-6)' }}>
        {invoiceAging.total === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No open invoices yet — invoice data will populate here as tickets are processed.
          </p>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              {[
                { key: '0-30',  label: '0–30 days',  color: 'var(--age-ok)' },
                { key: '31-60', label: '31–60 days', color: 'var(--age-warn)' },
                { key: '60+',   label: '60+ days',   color: 'var(--age-critical)' },
              ].map(({ key, label, color }) => (
                <div key={key} style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  border: invoiceAging.buckets[key].length > 0 ? `2px solid ${color}` : '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color }}>{invoiceAging.buckets[key].length}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {state.invoices.filter(inv => inv.status !== 'POSTED').map(inv => {
                const days = ageDays(inv.createdAt)
                const job = state.jobs.find(j => j.id === inv.jobId)
                const cust = job ? state.customers.find(c => c.id === job.customerId) : null
                return (
                  <div key={inv.id} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    fontSize: 'var(--text-sm)', flexWrap: 'wrap',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: 100 }}>{inv.id}</span>
                    <span style={{ flex: 1 }}>{cust?.name ?? inv.jobId}</span>
                    <AgeIndicator daysOpen={days} />
                    <Badge status={inv.status} label={inv.status} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* ── Deferred KPIs note ── */}
      <Card style={{ background: 'var(--bg)', border: '1px dashed var(--border-dark)' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
          Coming in V1 — requires full production data
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            'Revenue by customer / job',
            'Billing error rate (exceptions resolved vs. charged)',
            'Job & ticket throughput (volume over time)',
            'Average time to invoice (submission → posting)',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              <span>○</span> {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
