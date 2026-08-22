import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import Badge from '../common/Badge.jsx'
import AgeIndicator from '../common/AgeIndicator.jsx'
import { formatDate, getJob, getCustomer } from '../../utils.js'
import { TICKET_STATUS_LABELS } from '../../data/constants.js'

export default function TicketCard({ ticket, action, expanded = false }) {
  const { state } = useAppState()
  const navigate = useNavigate()
  const job = getJob(state.jobs, ticket.jobId)
  const customer = getCustomer(state.customers, job?.customerId)

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--card)',
      padding: 'var(--space-4)',
      transition: 'box-shadow var(--transition-fast)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>{ticket.id}</span>
            <Badge status={ticket.type === 'RIG_MOVE' ? 'draft' : 'signed'} label={ticket.type === 'RIG_MOVE' ? 'Rig Move' : 'Rental'} />
            <Badge status={ticket.status} label={TICKET_STATUS_LABELS[ticket.status] ?? ticket.status} />
            {ticket.exceptionFlags?.length > 0 && (
              <Badge status="flagged" label={`${ticket.exceptionFlags.length} Flag${ticket.exceptionFlags.length > 1 ? 's' : ''}`} />
            )}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {ticket.jobId} · {customer?.name ?? '—'} · {job?.region ?? '—'}
          </div>
          {ticket.type === 'RIG_MOVE' && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
              Rig-up: {formatDate(ticket.rigUpDate)} → Rig-down: {formatDate(ticket.rigDownDate)}
            </div>
          )}
          {ticket.type === 'RENTAL' && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
              {ticket.stints?.length ?? 0} stint{ticket.stints?.length !== 1 ? 's' : ''} · {ticket.wellName}
            </div>
          )}
          {ticket.daysOpen > 0 && (
            <div style={{ marginTop: 4 }}>
              <AgeIndicator daysOpen={ticket.daysOpen} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, flexWrap: 'wrap' }}>
          {(ticket.status === 'PENDING_SIGNATURE' || ticket.status === 'CFO_APPROVED') && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/shared/signature/${ticket.id}`)}
            >
              ✍️ Capture Signature
            </button>
          )}
          {ticket.status === 'SIGNED' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/shared/invoice/${ticket.id}`)}
            >
              📄 View Invoice
            </button>
          )}
          {ticket.status === 'INVOICED' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate(`/shared/invoice/${ticket.id}`)}
            >
              📄 Invoice
            </button>
          )}
          {action}
        </div>
      </div>
    </div>
  )
}
