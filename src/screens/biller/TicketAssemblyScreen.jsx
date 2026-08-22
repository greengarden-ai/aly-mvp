import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { ADD_APPROVAL, UPDATE_TICKET_STATUS } from '../../context/actions.js'
import { isRigMoveComplete, getJob, getCustomer, formatDate, computeStintTotal, formatCurrency } from '../../utils.js'
import { TICKET_STATUSES, TICKET_STATUS_LABELS } from '../../data/constants.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import TicketCard from '../../components/domain/TicketCard.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'
import RentalStintRow from '../../components/domain/RentalStintRow.jsx'

function RigMoveChecklist({ ticket }) {
  const checks = [
    { label: 'Rig-up date recorded', ok: !!ticket.rigUpDate },
    { label: 'Rig-down date recorded', ok: !!ticket.rigDownDate },
    { label: `${ticket.equipmentItems?.length ?? 0} equipment item(s) listed`, ok: (ticket.equipmentItems?.length ?? 0) > 0 },
    ...((ticket.equipmentItems ?? []).map(eq => ({
      label: `Trucking form — ${eq.description || eq.equipmentId}`,
      ok: !!eq.hasTruckingForm,
    }))),
  ]
  const allOk = checks.every(c => c.ok)
  return (
    <div style={{ marginTop: 'var(--space-3)' }}>
      <div style={{ marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
        Completeness Check
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checks.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <span style={{ color: c.ok ? 'var(--status-approved)' : 'var(--status-flagged)', fontWeight: 700, fontSize: 15 }}>
              {c.ok ? '✓' : '✗'}
            </span>
            <span style={{ color: c.ok ? 'var(--text)' : 'var(--status-flagged)' }}>{c.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'var(--space-3)' }}>
        {allOk
          ? <span style={{ color: 'var(--status-approved)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>✓ All forms present — ready to approve</span>
          : <span style={{ color: 'var(--status-flagged)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>⚠ Missing items — cannot approve until resolved</span>
        }
      </div>
    </div>
  )
}

export default function TicketAssemblyScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)
  const [billerNotes, setBillerNotes] = useState({})

  const pending = state.tickets.filter(t => t.status === TICKET_STATUSES.PENDING_BILLER)
  const others = state.tickets.filter(t => t.status !== TICKET_STATUSES.PENDING_BILLER)

  function approve(ticket) {
    dispatch({
      type: ADD_APPROVAL,
      payload: {
        ticketId: ticket.id,
        newStatus: TICKET_STATUSES.PENDING_APPROVER,
        entry: {
          step: 'BILLER',
          approvedBy: 'u-001',
          approvedAt: new Date().toISOString(),
          notes: billerNotes[ticket.id] ?? '',
        },
      },
    })
    if (expanded === ticket.id) setExpanded(null)
  }

  function renderTicketDetail(ticket) {
    const job = getJob(state.jobs, ticket.jobId)
    const complete = ticket.type === 'RIG_MOVE' ? isRigMoveComplete(ticket) : true
    return (
      <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
        {job && <JobSummaryCard job={job} compact />}
        <div style={{ marginTop: 'var(--space-4)' }}>
          {ticket.type === 'RIG_MOVE' && (
            <>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                Crew: {ticket.crewSource} · Manager: {ticket.managerApproval}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                Rig-up: <strong>{formatDate(ticket.rigUpDate)}</strong> → Rig-down: <strong>{formatDate(ticket.rigDownDate)}</strong>
              </div>
              <RigMoveChecklist ticket={ticket} />
            </>
          )}
          {ticket.type === 'RENTAL' && (
            <>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Well: {ticket.wellName}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ticket.stints?.map((s, i) => <RentalStintRow key={s.id ?? i} stint={s} index={i} />)}
              </div>
              <div style={{ marginTop: 'var(--space-3)', fontWeight: 700, textAlign: 'right' }}>
                Total: {formatCurrency(computeStintTotal(ticket.stints ?? []))}
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            Biller Notes (optional)
          </label>
          <textarea
            className="form-input"
            rows={2}
            value={billerNotes[ticket.id] ?? ''}
            onChange={e => setBillerNotes(n => ({ ...n, [ticket.id]: e.target.value }))}
            placeholder="Notes for approver…"
          />
        </div>

        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
          <Button
            variant="primary"
            disabled={ticket.type === 'RIG_MOVE' && !complete}
            onClick={() => approve(ticket)}
            title={!complete ? 'Complete all checklist items before approving' : undefined}
          >
            ✓ Approve & Release for Regional Review
          </Button>
          <Button variant="ghost" onClick={() => setExpanded(null)}>Close</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ticket Assembly</h1>
        <p className="page-subtitle">Review completeness and release tickets for approval</p>
      </div>

      {pending.length === 0 && (
        <StatusBanner type="info" className="mb-5">
          No tickets pending Biller review. Submit a field ticket first, or check the queue below for in-progress tickets.
        </StatusBanner>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h3 className="section-title">Pending Review ({pending.length})</h3>
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
                {expanded === ticket.id && renderTicketDetail(ticket)}
              </Card>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h3 className="section-title">All Other Tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {others.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
