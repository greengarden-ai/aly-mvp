import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { RESOLVE_EXCEPTION } from '../../context/actions.js'
import { formatCurrency, getJob, getCustomer, getTicket } from '../../utils.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import AgeIndicator from '../../components/common/AgeIndicator.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import ApprovalChainViz from '../../components/domain/ApprovalChainViz.jsx'

const TYPE_META = {
  DOUBLE_BOOKING:     { icon: '🔄', label: 'Double-Booking', color: 'var(--status-flagged)',  bg: '#fde8e8', border: '#f4a7a7' },
  SELF_MOVE_FLAGGED:  { icon: '🚩', label: 'Rig Self-Move',  color: '#7a4f00',                bg: 'var(--accent-light)', border: '#f5c96c' },
  PAST_SLA:           { icon: '⏱️', label: 'Past SLA',       color: 'var(--status-flagged)',  bg: '#fde8e8', border: '#f4a7a7' },
  ROUTING_COMPARISON: { icon: '🗺️', label: 'Routing Highlight', color: 'var(--navy-light)',  bg: '#e8f0fb', border: '#b3c8f0' },
}

function ResolveButton({ exception }) {
  const { dispatch } = useAppState()
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)

  if (exception.status === 'RESOLVED') {
    return <Badge status="RESOLVED" label="Resolved" />
  }
  if (!open) {
    return <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Mark Resolved</Button>
  }
  return (
    <div style={{ marginTop: 'var(--space-3)' }}>
      <textarea
        className="form-input"
        rows={2}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Resolution notes…"
        style={{ marginBottom: 'var(--space-2)' }}
      />
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button variant="primary" size="sm" onClick={() => {
          dispatch({
            type: RESOLVE_EXCEPTION,
            payload: {
              exceptionId: exception.id,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'alya',
              notes,
            },
          })
          setOpen(false)
        }}>Confirm</Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  )
}

function ExceptionCard({ exception }) {
  const { state } = useAppState()
  const navigate = useNavigate()
  const meta = TYPE_META[exception.type] ?? TYPE_META.DOUBLE_BOOKING
  const isResolved = exception.status === 'RESOLVED'

  const ticket = exception.ticketId ? getTicket(state.tickets, exception.ticketId) : null
  const job = exception.jobId ? getJob(state.jobs, exception.jobId) : null
  const customer = job ? getCustomer(state.customers, job.customerId) : null

  // For routing comparison, get both tickets
  const ticketA = exception.ticketIds?.[0] ? getTicket(state.tickets, exception.ticketIds[0]) : null
  const ticketB = exception.ticketIds?.[1] ? getTicket(state.tickets, exception.ticketIds[1]) : null
  const jobA = ticketA ? getJob(state.jobs, ticketA.jobId) : null
  const jobB = ticketB ? getJob(state.jobs, ticketB.jobId) : null

  return (
    <Card style={{ opacity: isResolved ? 0.65 : 1 }}>
      {/* Header strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        margin: 'calc(-1 * var(--space-5)) calc(-1 * var(--space-5)) var(--space-4)',
        background: meta.bg,
        borderBottom: `1px solid ${meta.border}`,
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 20 }}>{meta.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: meta.color }}>{meta.label}</span>
          {exception.type !== 'ROUTING_COMPARISON' && (
            <Badge status={exception.status} label={isResolved ? 'Resolved' : 'Open'} />
          )}
        </div>
        <div style={{ display: 'flex', align: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          {exception.ticketId && <span>{exception.ticketId}</span>}
          {customer && <span>{customer.name}</span>}
          {exception.amount && (
            <span style={{ fontWeight: 700, color: 'var(--status-flagged)' }}>
              {formatCurrency(exception.amount)}
            </span>
          )}
          {exception.daysOpen && <AgeIndicator daysOpen={exception.daysOpen} />}
        </div>
      </div>

      {/* Body */}
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
        {exception.notes}
      </p>

      {/* Double-booking detail */}
      {exception.type === 'DOUBLE_BOOKING' && ticket && (
        <div style={{
          background: 'var(--bg)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)',
        }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', letterSpacing: '0.05em' }}>
            CONCURRENT RENTAL PERIODS — {exception.equipmentName}
          </div>
          {ticket.stints?.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-2) 0',
              borderBottom: i < ticket.stints.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: 'var(--text-sm)',
            }}>
              <div>
                <span style={{ fontWeight: 600 }}>Period {i + 1}:</span>{' '}
                {s.startDate} →{' '}
                <span style={{ color: s.endDate ? 'var(--text)' : 'var(--status-flagged)', fontWeight: s.endDate ? 400 : 700 }}>
                  {s.endDate || 'NEVER CLOSED'}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>{formatCurrency(s.dailyRate)}/day</div>
            </div>
          ))}
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-5)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Overlap Duration</div>
              <div style={{ fontWeight: 700, color: 'var(--status-flagged)' }}>27 days</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Duplicate Charges</div>
              <div style={{ fontWeight: 700, color: 'var(--status-flagged)', fontSize: 'var(--text-lg)' }}>
                {formatCurrency(exception.amount)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Self-move equipment detail */}
      {exception.type === 'SELF_MOVE_FLAGGED' && ticket && (
        <div style={{
          background: 'var(--bg)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)',
        }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', letterSpacing: '0.05em' }}>
            EQUIPMENT RELOCATED WITH RIG — NO FIELD EVENT CAPTURED
          </div>
          {ticket.equipmentItems?.map((eq, i) => (
            <div key={i} style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-1) 0' }}>
              <span style={{ fontWeight: 600 }}>{eq.description}</span>
              {' · '}<span style={{ color: 'var(--text-muted)' }}>{eq.serialNumber}</span>
              {' · '}<span style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>{eq.ownership}</span>
            </div>
          ))}
          <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--status-flagged)', fontWeight: 600 }}>
            ⚠ Invisible in KPA/JobUTrax — this platform is the only record of this movement
          </div>
        </div>
      )}

      {/* Routing comparison — side by side chains */}
      {exception.type === 'ROUTING_COMPARISON' && ticketA && ticketB && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          {[[ticketA, jobA, 'STX'], [ticketB, jobB, 'WTX']].map(([tkt, jb, region]) => (
            <div key={region} style={{
              background: 'var(--bg)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <span style={{
                  background: 'var(--navy)', color: 'white',
                  borderRadius: 'var(--radius-pill)', padding: '2px 10px',
                  fontSize: 'var(--text-xs)', fontWeight: 700,
                  marginRight: 'var(--space-2)',
                }}>{region}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{jb?.wellName}</span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                  {getCustomer(state.customers, jb?.customerId)?.name}
                </div>
              </div>
              <ApprovalChainViz region={region} ticket={tkt} />
              <div style={{ marginTop: 'var(--space-2)' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/approver/routing`)}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  View in Approval Queue →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline fleet status for ticket */}
      {ticket && ticket.equipmentItems?.length > 0 && exception.type !== 'ROUTING_COMPARISON' && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          {ticket.equipmentItems.map((eq, i) => {
            const fleetItem = state.equipment.find(e => e.id === eq.equipmentId || e.name === eq.description)
            if (!fleetItem) return null
            return (
              <div key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 2 }}>
                <span>Fleet status:</span>
                <span style={{ fontWeight: 600 }}>{fleetItem.name}</span>
                <Badge status={fleetItem.status} label={fleetItem.status?.replace(/_/g, ' ')} />
              </div>
            )
          })}
        </div>
      )}

      {/* Resolve action */}
      {exception.type !== 'ROUTING_COMPARISON' && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <ResolveButton exception={exception} />
        </div>
      )}
    </Card>
  )
}

export default function ExceptionQueueScreen() {
  const { state } = useAppState()
  const [filter, setFilter] = useState('ALL')

  const flags = state.exceptions.filter(e => e.type !== 'ROUTING_COMPARISON')
  const highlights = state.exceptions.filter(e => e.type === 'ROUTING_COMPARISON')
  const openCount = flags.filter(e => e.status === 'OPEN').length

  const filteredFlags = filter === 'OPEN'
    ? flags.filter(e => e.status === 'OPEN')
    : filter === 'RESOLVED'
      ? flags.filter(e => e.status === 'RESOLVED')
      : flags

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Exception Queue</h1>
        <p className="page-subtitle">
          {openCount} open exception{openCount !== 1 ? 's' : ''} requiring attention
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        {['ALL', 'OPEN', 'RESOLVED'].map(f => (
          <button
            key={f}
            className={`btn btn-${filter === f ? 'navy' : 'secondary'} btn-sm`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? `All (${flags.length})` : f === 'OPEN' ? `Open (${flags.filter(e => e.status === 'OPEN').length})` : `Resolved (${flags.filter(e => e.status === 'RESOLVED').length})`}
          </button>
        ))}
      </div>

      {/* Exception flags */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {filteredFlags.map(ex => <ExceptionCard key={ex.id} exception={ex} />)}
        {filteredFlags.length === 0 && (
          <StatusBanner type="success">No exceptions in this category.</StatusBanner>
        )}
      </div>

      {/* Routing highlight */}
      {highlights.length > 0 && (
        <div>
          <h3 className="section-title">Demo Highlights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {highlights.map(ex => <ExceptionCard key={ex.id} exception={ex} />)}
          </div>
        </div>
      )}
    </div>
  )
}
