import { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { ADD_APPROVAL } from '../../context/actions.js'
import { ROLES, TICKET_STATUSES } from '../../data/constants.js'
import { getJob, getCustomer, formatDate, computeStintTotal, formatCurrency } from '../../utils.js'
import Card from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import TicketCard from '../../components/domain/TicketCard.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'
import ApprovalChainViz from '../../components/domain/ApprovalChainViz.jsx'
import RentalStintRow from '../../components/domain/RentalStintRow.jsx'

export default function ApprovalRoutingScreen() {
  const { state, dispatch } = useAppState()
  const [expanded, setExpanded] = useState(null)
  const [notes, setNotes] = useState({})

  const region = state.currentRole === ROLES.APPROVER_STX ? 'STX' : 'WTX'
  const pending = state.tickets.filter(t =>
    t.status === TICKET_STATUSES.PENDING_APPROVER && t.region === region
  )

  function approve(ticket) {
    // Rental: skip CFO if toggle is off
    const skipCFO = ticket.type === 'RENTAL' && !state.config.requireCFOApprovalOnRentals
    const nextStatus = skipCFO
      ? TICKET_STATUSES.PENDING_SIGNATURE
      : TICKET_STATUSES.PENDING_CFO

    dispatch({
      type: ADD_APPROVAL,
      payload: {
        ticketId: ticket.id,
        newStatus: nextStatus,
        entry: {
          step: 'APPROVER',
          approvedBy: region === 'STX' ? 'u-002' : 'u-004',
          approvedAt: new Date().toISOString(),
          notes: notes[ticket.id] ?? '',
        },
      },
    })
    if (expanded === ticket.id) setExpanded(null)
  }

  function renderDetail(ticket) {
    const job = getJob(state.jobs, ticket.jobId)
    return (
      <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
        {job && <JobSummaryCard job={job} compact />}

        <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--navy)' }}>
            {region} Approval Chain
          </div>
          <ApprovalChainViz region={region} ticket={ticket} />
        </div>

        {ticket.type === 'RIG_MOVE' && (
          <div style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Rig-up: {formatDate(ticket.rigUpDate)} → Rig-down: {formatDate(ticket.rigDownDate)}
            {' · '}{ticket.equipmentItems?.length ?? 0} equipment item(s)
          </div>
        )}

        {ticket.type === 'RENTAL' && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Well: {ticket.wellName}</div>
            {ticket.stints?.map((s, i) => <RentalStintRow key={s.id ?? i} stint={s} index={i} />)}
            <div style={{ marginTop: 'var(--space-2)', fontWeight: 700, textAlign: 'right', fontSize: 'var(--text-sm)' }}>
              Total: {formatCurrency(computeStintTotal(ticket.stints ?? []))}
            </div>
            {!state.config.requireCFOApprovalOnRentals && (
              <StatusBanner type="info" className="mt-3">
                CFO approval for rental tickets is currently <strong>off</strong>. Approving this ticket will route it directly to signature.
              </StatusBanner>
            )}
          </div>
        )}

        {ticket.billerNotes && (
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
            <strong>Biller notes:</strong> {ticket.billerNotes}
          </div>
        )}

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            Approval Notes (optional)
          </label>
          <textarea className="form-input" rows={2} value={notes[ticket.id] ?? ''}
            onChange={e => setNotes(n => ({ ...n, [ticket.id]: e.target.value }))}
            placeholder="Notes for CFO / billing team…" />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary" onClick={() => approve(ticket)}>✓ Approve</Button>
          <Button variant="ghost" onClick={() => setExpanded(null)}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Approval Queue — {region}</h1>
        <p className="page-subtitle">
          {region === 'STX'
            ? 'STX tickets route through: Jaime Reyes → Lindsey Tran → Alya → Customer'
            : 'WTX tickets route through: Aaron Griffith → Alya → Customer'}
        </p>
      </div>

      {pending.length === 0 && (
        <StatusBanner type="info">
          No {region} tickets pending your approval.
        </StatusBanner>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {pending.map(ticket => (
          <Card key={ticket.id}>
            <TicketCard
              ticket={ticket}
              action={
                <Button
                  variant={expanded === ticket.id ? 'ghost' : 'secondary'}
                  size="sm"
                  onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                >
                  {expanded === ticket.id ? 'Close' : 'Review'}
                </Button>
              }
            />
            {expanded === ticket.id && renderDetail(ticket)}
          </Card>
        ))}
      </div>

      {/* Also show in-flight tickets for this region */}
      {(() => {
        const others = state.tickets.filter(t =>
          t.region === region &&
          t.status !== TICKET_STATUSES.PENDING_APPROVER &&
          t.status !== TICKET_STATUSES.DRAFT &&
          t.status !== TICKET_STATUSES.PENDING_BILLER
        )
        if (!others.length) return null
        return (
          <div style={{ marginTop: 'var(--space-6)' }}>
            <h3 className="section-title">In Progress — {region}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {others.map(t => <TicketCard key={t.id} ticket={t} />)}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
