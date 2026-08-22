import { useParams, useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { CREATE_INVOICE } from '../../context/actions.js'
import {
  genId, getTicket, getJob, getCustomer,
  formatDate, formatDateTime, formatCurrency,
  computeStintTotal, daysBetween,
} from '../../utils.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import Badge from '../../components/common/Badge.jsx'
import SagePostButton from '../../components/common/SagePostButton.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'
import RentalStintRow from '../../components/domain/RentalStintRow.jsx'

function computeRigMoveTotal(ticket) {
  return ticket.equipmentItems?.reduce((sum, item) => sum + (item.quantity ?? 1) * 0, 0) ?? 0
}

export default function InvoiceScreen() {
  const { ticketId } = useParams()
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()

  const ticket = getTicket(state.tickets, ticketId)
  const job = ticket ? getJob(state.jobs, ticket.jobId) : null
  const customer = job ? getCustomer(state.customers, job.customerId) : null
  const invoice = ticket?.invoiceId
    ? state.invoices.find(inv => inv.id === ticket.invoiceId)
    : null

  const signature = ticket?.signatureId
    ? state.signatures.find(s => s.id === ticket.signatureId)
    : null

  if (!ticket || !job) {
    return (
      <div className="page-header">
        <h1 className="page-title">Invoice</h1>
        <StatusBanner type="error">Ticket not found: {ticketId}</StatusBanner>
      </div>
    )
  }

  const total = ticket.type === 'RENTAL'
    ? computeStintTotal(ticket.stints ?? [])
    : null  // rig move pricing is set by CFO — shown as TBD in prototype

  function generateInvoice() {
    const inv = {
      id: genId('INV'),
      ticketIds: [ticket.id],
      jobId: ticket.jobId,
      status: 'DRAFT',
      totalAmount: total ?? 0,
      intacctPostId: null,
      intacctPostedAt: null,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: CREATE_INVOICE, payload: { invoice: inv, ticketIds: [ticket.id] } })
  }

  const canSign = ticket.status === 'PENDING_SIGNATURE' && !signature
  const isSigned = ticket.status === 'SIGNED' || ticket.status === 'INVOICED' || !!signature
  const canInvoice = isSigned && !invoice
  const canPost = !!invoice && invoice.status !== 'POSTED'
  const isPosted = invoice?.status === 'POSTED'

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Invoice</h1>
        <p className="page-subtitle">Ticket {ticket.id} · {customer?.name}</p>
      </div>

      <JobSummaryCard job={job} />

      {/* Workflow status */}
      <div style={{
        display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
        flexWrap: 'wrap', marginBottom: 'var(--space-5)',
      }}>
        {[
          { label: 'Submitted', done: true },
          { label: 'Biller Approved', done: ticket.approvalChain?.some(a => a.step === 'BILLER') },
          { label: 'Region Approved', done: ticket.approvalChain?.some(a => a.step === 'APPROVER') },
          { label: 'CFO Approved', done: ticket.approvalChain?.some(a => a.step === 'CFO') },
          { label: 'Signed', done: isSigned },
          { label: 'Invoiced', done: !!invoice },
          { label: 'Posted', done: isPosted },
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {i > 0 && <div style={{ width: 16, height: 1, background: step.done ? 'var(--status-approved)' : 'var(--border)' }} />}
            <span style={{
              fontSize: 'var(--text-xs)', fontWeight: 600,
              color: step.done ? 'var(--status-approved)' : 'var(--text-muted)',
            }}>
              {step.done ? '✓ ' : ''}{step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Ticket details */}
      <Card style={{ marginBottom: 'var(--space-5)' }}>
        <CardHeader title="Service Details" />
        {ticket.type === 'RIG_MOVE' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Rig-Up</div>
                <div style={{ fontWeight: 600 }}>{formatDate(ticket.rigUpDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Rig-Down</div>
                <div style={{ fontWeight: 600 }}>{formatDate(ticket.rigDownDate)}</div>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Ownership</th>
                    <th>Serial</th>
                    <th>Qty</th>
                    <th>Trucking Form</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.equipmentItems?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td>{item.ownership}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{item.serialNumber}</td>
                      <td>{item.quantity}</td>
                      <td style={{ color: item.hasTruckingForm ? 'var(--status-approved)' : 'var(--status-flagged)', fontWeight: 700 }}>
                        {item.hasTruckingForm ? '✓' : '✗'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 'var(--space-3)', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Pricing to be confirmed by CFO — contact billing for final amount.
            </div>
          </div>
        )}

        {ticket.type === 'RENTAL' && (
          <div>
            <div style={{ marginBottom: 'var(--space-3)', fontWeight: 600 }}>Well: {ticket.wellName}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ticket.stints?.map((s, i) => <RentalStintRow key={s.id ?? i} stint={s} index={i} />)}
            </div>
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Total Due</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--navy)' }}>
                {formatCurrency(total)}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Signature record */}
      {signature && (
        <Card style={{ marginBottom: 'var(--space-5)' }}>
          <CardHeader title="Signature on File" />
          <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Signed By</div>
              <div style={{ fontWeight: 600 }}>{signature.signedBy}</div>
              {signature.signerTitle && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{signature.signerTitle}</div>}
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{formatDateTime(signature.signedAt)}</div>
            </div>
            {signature.canvasDataUrl && (
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Signature</div>
                <img
                  src={signature.canvasDataUrl}
                  alt="Captured signature"
                  style={{ maxWidth: 200, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: '#fafbfc' }}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Signature required prompt */}
      {canSign && (
        <StatusBanner type="warning" className="mb-5">
          A customer signature is required before generating the invoice.
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/shared/signature/${ticket.id}`)}>
              ✍️ Capture Signature
            </Button>
          </div>
        </StatusBanner>
      )}

      {/* Invoice generation + Sage post */}
      <Card>
        <CardHeader title="Invoice & Posting" />
        {!isSigned && !invoice && (
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Complete signature capture before generating the invoice.
          </p>
        )}

        {canInvoice && (
          <div>
            <Button variant="navy" size="lg" onClick={generateInvoice}>Generate Invoice</Button>
          </div>
        )}

        {invoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
              {[
                ['Invoice ID', invoice.id],
                ['Job', ticket.jobId],
                ['Customer', customer?.name],
                ['Created', formatDate(invoice.createdAt)],
                ['Status', invoice.status],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{val}</div>
                </div>
              ))}
            </div>

            <div className="divider" />

            <SagePostButton
              invoice={invoice}
              disabled={!canPost}
              disabledReason={isPosted ? undefined : !isSigned ? 'Awaiting customer signature' : undefined}
            />
          </div>
        )}
      </Card>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      </div>
    </div>
  )
}
