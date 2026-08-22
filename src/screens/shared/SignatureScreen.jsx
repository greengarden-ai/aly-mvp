import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { ADD_SIGNATURE } from '../../context/actions.js'
import { genId, getTicket, getJob, getCustomer, formatDate } from '../../utils.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import FormField, { Input } from '../../components/common/FormField.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import SignaturePad from '../../components/common/SignaturePad.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'
import Badge from '../../components/common/Badge.jsx'

export default function SignatureScreen() {
  const { ticketId } = useParams()
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [signerName, setSignerName] = useState('')
  const [signerTitle, setSignerTitle] = useState('')
  const [error, setError] = useState(null)
  const [signed, setSigned] = useState(false)

  const ticket = getTicket(state.tickets, ticketId)
  const job = ticket ? getJob(state.jobs, ticket.jobId) : null
  const customer = job ? getCustomer(state.customers, job.customerId) : null

  if (!ticket) {
    return (
      <div className="page-header">
        <h1 className="page-title">Signature Capture</h1>
        <StatusBanner type="error">Ticket not found: {ticketId}</StatusBanner>
      </div>
    )
  }

  if (ticket.status === 'SIGNED' || ticket.status === 'INVOICED' || signed) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Signature Captured</h1>
        </div>
        <Card style={{ maxWidth: 560 }}>
          <StatusBanner type="success">
            Ticket <strong>{ticket.id}</strong> has been signed. Proceed to generate the invoice.
          </StatusBanner>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="primary" onClick={() => navigate(`/shared/invoice/${ticket.id}`)}>
              → Generate Invoice
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </Card>
      </div>
    )
  }

  const canSign = ticket.status === 'PENDING_SIGNATURE' || ticket.status === 'CFO_APPROVED'

  function handleConfirm(dataUrl) {
    if (!signerName.trim()) { setError('Signer name is required'); return }
    setError(null)
    const sig = {
      id: genId('SIG'),
      ticketId: ticket.id,
      signedBy: signerName.trim(),
      signerTitle: signerTitle.trim(),
      signedAt: new Date().toISOString(),
      canvasDataUrl: dataUrl,
    }
    dispatch({ type: ADD_SIGNATURE, payload: { ticketId: ticket.id, signature: sig } })
    setSigned(true)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Signature Capture</h1>
        <p className="page-subtitle">Customer authorization for ticket {ticket.id}</p>
      </div>

      {/* Ticket summary */}
      <Card style={{ marginBottom: 'var(--space-5)' }}>
        <CardHeader title="Ticket Summary" />
        {job && <JobSummaryCard job={job} compact />}
        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Badge status={ticket.type === 'RIG_MOVE' ? 'draft' : 'signed'} label={ticket.type === 'RIG_MOVE' ? 'Rig Move' : 'Rental'} />
          <Badge status={ticket.status} />
        </div>
        {ticket.type === 'RIG_MOVE' && (
          <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Rig-up: {formatDate(ticket.rigUpDate)} → Rig-down: {formatDate(ticket.rigDownDate)}
            {' · '}{ticket.equipmentItems?.length ?? 0} equipment item(s)
          </div>
        )}
        {ticket.type === 'RENTAL' && (
          <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Well: {ticket.wellName} · {ticket.stints?.length ?? 0} rental stint(s)
          </div>
        )}
      </Card>

      {!canSign && (
        <StatusBanner type="warning" className="mb-5">
          This ticket is not yet ready for signature. Current status: <strong>{ticket.status}</strong>.
          It must complete CFO approval before a signature can be captured.
        </StatusBanner>
      )}

      {canSign && (
        <Card style={{ maxWidth: 640 }}>
          <CardHeader title="Authorized Signature" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="grid-2">
              <FormField label="Signer Name" required error={error}>
                <Input
                  value={signerName}
                  onChange={e => { setSignerName(e.target.value); setError(null) }}
                  placeholder={`${customer?.contact ?? 'Customer name'}`}
                />
              </FormField>
              <FormField label="Title / Role">
                <Input value={signerTitle} onChange={e => setSignerTitle(e.target.value)} placeholder="e.g. VP Operations" />
              </FormField>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                Signature
              </div>
              <SignaturePad onConfirm={handleConfirm} />
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              By signing above, the authorized representative of <strong>{customer?.name ?? 'Customer'}</strong> confirms the
              accuracy of the services described in ticket <strong>{ticket.id}</strong> and authorizes invoicing for the
              amounts specified.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
