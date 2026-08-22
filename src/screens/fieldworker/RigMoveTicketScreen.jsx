import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { CREATE_TICKET } from '../../context/actions.js'
import { genId } from '../../utils.js'
import { TICKET_STATUSES, OWNERSHIP_TYPES, CONTAINMENT_TYPES, EQUIPMENT_STATUSES } from '../../data/constants.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import FormField, { Input, Select, Textarea } from '../../components/common/FormField.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'
import JobSummaryCard from '../../components/domain/JobSummaryCard.jsx'

const BLANK_ITEM = () => ({
  _key: Math.random(),
  equipmentId: '',
  description: '',
  ownership: 'DMP',
  serialNumber: '',
  quantity: 1,
  containmentType: 'Steel',
  containmentSize: '',
  hasTruckingForm: false,
})

export default function RigMoveTicketScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [jobId, setJobId] = useState('')
  const [form, setForm] = useState({
    crewSource: '',
    managerApproval: '',
    rigUpDate: '',
    rigDownDate: '',
  })
  const [items, setItems] = useState([BLANK_ITEM()])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

  const job = state.jobs.find(j => j.id === jobId)
  const yardEquipment = state.equipment.filter(e => e.status === EQUIPMENT_STATUSES.IN_YARD)

  function setF(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  function updateItem(idx, field, val) {
    setItems(items => items.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: val }
      if (field === 'equipmentId' && val) {
        const eq = state.equipment.find(e => e.id === val)
        if (eq) {
          updated.description = eq.name
          updated.serialNumber = eq.serialNumber
        }
      }
      return updated
    }))
  }

  function addItem() { setItems(items => [...items, BLANK_ITEM()]) }
  function removeItem(idx) { setItems(items => items.filter((_, i) => i !== idx)) }

  function validate() {
    const e = {}
    if (!jobId) e.jobId = 'Select a job'
    if (!form.crewSource.trim()) e.crewSource = 'Required'
    if (!form.rigUpDate) e.rigUpDate = 'Required'
    if (!form.rigDownDate) e.rigDownDate = 'Required'
    if (!form.managerApproval.trim()) e.managerApproval = 'Required'
    if (!items.length) e.items = 'Add at least one equipment item'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const ticket = {
      id: genId('TKT-RM'),
      type: 'RIG_MOVE',
      jobId,
      region: job.region,
      status: TICKET_STATUSES.PENDING_BILLER,
      fieldWorkerId: 'current-user',
      submittedAt: new Date().toISOString(),
      rigUpDate: form.rigUpDate,
      rigDownDate: form.rigDownDate,
      crewSource: form.crewSource.trim(),
      managerApproval: form.managerApproval.trim(),
      equipmentItems: items.map(({ _key, ...rest }) => rest),
      hasTruckingFormForAll: items.every(i => i.hasTruckingForm),
      billerNotes: '',
      approvalChain: [],
      exceptionFlags: [],
      selfMove: false,
      signatureId: null,
      invoiceId: null,
    }
    dispatch({ type: CREATE_TICKET, payload: ticket })
    setSubmitted(ticket)
  }

  if (submitted) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Rig Move Ticket</h1>
        </div>
        <Card style={{ maxWidth: 560 }}>
          <StatusBanner type="success">
            Ticket <strong>{submitted.id}</strong> submitted — pending Biller review.
          </StatusBanner>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="navy" onClick={() => navigate('/biller/tickets')}>
              → Go to Biller Queue
            </Button>
            <Button variant="ghost" onClick={() => { setSubmitted(null); setJobId(''); setForm({ crewSource: '', managerApproval: '', rigUpDate: '', rigDownDate: '' }); setItems([BLANK_ITEM()]) }}>
              + New Ticket
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Rig Move Ticket</h1>
        <p className="page-subtitle">Capture rig-up / rig-down event and equipment hauled</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Job Selection */}
        <Card>
          <CardHeader title="Job Lookup" />
          <FormField label="Job Number" required error={errors.jobId}>
            <Select value={jobId} onChange={e => setJobId(e.target.value)}>
              <option value="">Select job…</option>
              {state.jobs.map(j => {
                const cust = state.customers.find(c => c.id === j.customerId)
                return <option key={j.id} value={j.id}>{j.id} — {cust?.name} ({j.region})</option>
              })}
            </Select>
          </FormField>
          {job && <div style={{ marginTop: 'var(--space-3)' }}><JobSummaryCard job={job} compact /></div>}
        </Card>

        {/* Visit Details */}
        <Card>
          <CardHeader title="Visit Details" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="grid-2">
              <FormField label="Rig-Up Date" required error={errors.rigUpDate}>
                <Input type="date" value={form.rigUpDate} onChange={e => setF('rigUpDate', e.target.value)} />
              </FormField>
              <FormField label="Rig-Down Date" required error={errors.rigDownDate}>
                <Input type="date" value={form.rigDownDate} onChange={e => setF('rigDownDate', e.target.value)} />
              </FormField>
            </div>
            <div className="grid-2">
              <FormField label="Crew Source" required error={errors.crewSource}>
                <Input value={form.crewSource} onChange={e => setF('crewSource', e.target.value)} placeholder="e.g. Aly Energy — STX Crew 1" />
              </FormField>
              <FormField label="Manager Approval (Name)" required error={errors.managerApproval}>
                <Input value={form.managerApproval} onChange={e => setF('managerApproval', e.target.value)} placeholder="e.g. Kyle Odom" />
              </FormField>
            </div>
          </div>
        </Card>

        {/* Equipment Items */}
        <Card>
          <CardHeader
            title={`Equipment Items (${items.length})`}
            action={<Button variant="secondary" size="sm" type="button" onClick={addItem}>+ Add Item</Button>}
          />
          {errors.items && <StatusBanner type="error" className="mb-3">{errors.items}</StatusBanner>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {items.map((item, idx) => (
              <div key={item._key} style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                background: 'var(--bg)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>Item {idx + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)}
                      style={{ color: 'var(--status-flagged)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                      ✕
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <FormField label="Select from Fleet (optional)">
                    <Select value={item.equipmentId} onChange={e => updateItem(idx, 'equipmentId', e.target.value)}>
                      <option value="">Manual entry…</option>
                      {yardEquipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.id} — {eq.name}</option>
                      ))}
                    </Select>
                  </FormField>
                  <div className="grid-2">
                    <FormField label="Description / Name">
                      <Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="e.g. BOP Stack" />
                    </FormField>
                    <FormField label="Serial Number">
                      <Input value={item.serialNumber} onChange={e => updateItem(idx, 'serialNumber', e.target.value)} placeholder="SN-XXX-0000" />
                    </FormField>
                  </div>
                  <div className="grid-2">
                    <FormField label="Ownership">
                      <Select value={item.ownership} onChange={e => updateItem(idx, 'ownership', e.target.value)}>
                        {Object.values(OWNERSHIP_TYPES).map(o => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Qty">
                      <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', +e.target.value)} />
                    </FormField>
                  </div>
                  <div className="grid-2">
                    <FormField label="Containment Type">
                      <Select value={item.containmentType} onChange={e => updateItem(idx, 'containmentType', e.target.value)}>
                        {CONTAINMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </Select>
                    </FormField>
                    <FormField label="Containment Size">
                      <Input value={item.containmentSize} onChange={e => updateItem(idx, 'containmentSize', e.target.value)} placeholder="e.g. 20 BBL" />
                    </FormField>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                    <input type="checkbox" checked={item.hasTruckingForm}
                      onChange={e => updateItem(idx, 'hasTruckingForm', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--navy)' }} />
                    Trucking form received for this item
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <Button type="submit" variant="primary" size="lg">Submit Rig Move Ticket</Button>
        </div>
      </form>
    </div>
  )
}
