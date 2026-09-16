import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { CREATE_JOB } from '../../context/actions.js'
import { genId } from '../../utils.js'
import { JOB_STATUSES } from '../../data/constants.js'
import { getPriceBooksForCustomer } from '../../data/priceBooks.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import FormField, { Input, Select, Textarea } from '../../components/common/FormField.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'

const TAXABLE_JURISDICTIONS = [
  { value: 'texas', label: 'Texas (8.25%)' },
  { value: 'louisiana', label: 'Louisiana (7%)' },
  { value: 'oklahoma', label: 'Oklahoma (6.5%)' },
  { value: 'non-taxable', label: 'Non-Taxable' },
]

export default function OrderIntakeScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [form, setForm] = useState({ customerId: '', wellName: '', taxableJurisdiction: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [created, setCreated] = useState(null)

  const customer = state.customers.find(c => c.id === form.customerId)
  const region = customer?.region ?? '—'
  const availablePriceBooks = customer ? getPriceBooksForCustomer(customer.id) : null

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.customerId) e.customerId = 'Select a customer'
    if (!form.wellName.trim()) e.wellName = 'Well name is required'
    if (!form.taxableJurisdiction) e.taxableJurisdiction = 'Select a jurisdiction'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const job = {
      id: genId('JOB'),
      customerId: form.customerId,
      region,
      wellName: form.wellName.trim(),
      taxableJurisdiction: form.taxableJurisdiction,
      status: JOB_STATUSES.ACTIVE,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user',
      notes: form.notes.trim(),
    }
    dispatch({ type: CREATE_JOB, payload: job })
    setCreated(job)
    setForm({ customerId: '', wellName: '', taxableJurisdiction: '', notes: '' })
  }

  if (created) {
    const jurisdictionLabel = TAXABLE_JURISDICTIONS.find(j => j.value === created.taxableJurisdiction)?.label || created.taxableJurisdiction
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Order Intake</h1>
        </div>
        <Card style={{ maxWidth: 560 }}>
          <StatusBanner type="success" className="mb-4">
            Job <strong>{created.id}</strong> created and ready for field ticketing.
          </StatusBanner>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              {[
                ['Job ID', created.id],
                ['Region', created.region],
                ['Customer', state.customers.find(c => c.id === created.customerId)?.name],
                ['Well', created.wellName],
                ['Jurisdiction', jurisdictionLabel],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button variant="navy" onClick={() => navigate('/fieldworker/rig-move')}>
                → Rig Move Ticket
              </Button>
              <Button variant="secondary" onClick={() => navigate('/fieldworker/rental')}>
                → Rental Ticket
              </Button>
              <Button variant="ghost" onClick={() => setCreated(null)}>
                + New Job
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Order Intake</h1>
        <p className="page-subtitle">Book a new job and customer record</p>
      </div>

      <Card style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Customer" required error={errors.customerId}>
              <Select value={form.customerId} onChange={e => set('customerId', e.target.value)}>
                <option value="">Select customer…</option>
                {state.customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormField>

            {customer && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Contact</div>
                  <div style={{ fontSize: 'var(--text-sm)' }}>{customer.contact}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Region (auto)</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{customer.region}</div>
                </div>
              </div>
            )}

            {availablePriceBooks && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>Price Book Reference (v1.1)</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  <strong>{customer.name}</strong> → Available Price Books:
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                  {availablePriceBooks.books.map(book => (
                    <span key={book} style={{
                      display: 'inline-block',
                      background: 'var(--navy)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                    }}>
                      {book}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <FormField label="Well Name" required error={errors.wellName}>
              <Input
                value={form.wellName}
                onChange={e => set('wellName', e.target.value)}
                placeholder="e.g. Well A-1"
              />
            </FormField>

            <FormField label="Taxable Jurisdiction" required error={errors.taxableJurisdiction}>
              <Select value={form.taxableJurisdiction} onChange={e => set('taxableJurisdiction', e.target.value)}>
                <option value="">Select jurisdiction…</option>
                {TAXABLE_JURISDICTIONS.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Notes">
              <Textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Optional notes about this job"
                rows={3}
              />
            </FormField>

            <Button type="submit" variant="primary" size="lg">
              Create Job Record
            </Button>
          </div>
        </form>
      </Card>

      <div style={{ marginTop: 'var(--space-6)' }}>
        <h3 className="section-title">Active Jobs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {state.jobs.map(job => {
            const cust = state.customers.find(c => c.id === job.customerId)
            const jurisdictionLabel = TAXABLE_JURISDICTIONS.find(j => j.value === job.taxableJurisdiction)?.label || job.taxableJurisdiction
            return (
              <div key={job.id} style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                fontSize: 'var(--text-sm)',
              }}>
                <span style={{ fontWeight: 700, color: 'var(--navy)', minWidth: 90 }}>{job.id}</span>
                <span style={{ flex: 1 }}>{cust?.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{job.wellName}</span>
                <span style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-pill)', padding: '2px 10px',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                }}>{job.region}</span>
                {job.taxableJurisdiction && (
                  <span style={{
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-pill)', padding: '2px 10px',
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                  }}>{jurisdictionLabel}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
