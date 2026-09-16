import { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { CREATE_TICKET } from '../../context/actions.js'
import { genId } from '../../utils.js'
import { TICKET_STATUSES } from '../../data/constants.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import FormField, { Input, Select, Textarea } from '../../components/common/FormField.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'

const TRUCKING_MODES = ['bundled', 'hourly', 'flat']

const BLANK_EQUIPMENT_ITEM = () => ({
  _key: Math.random(),
  description: '',
  qty: 1,
  rate: 0,
})

export default function TruckingTicketTab({ jobId, job }) {
  const { state, dispatch } = useAppState()
  const [form, setForm] = useState({
    originLocation: '',
    originDate: '',
    destinationLocation: '',
    destinationDate: '',
    mileage: '',
    truckingMode: 'flat',
    notes: '',
  })
  const [equipmentItems, setEquipmentItems] = useState([BLANK_EQUIPMENT_ITEM()])
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(null)

  function setF(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  function updateEquipmentItem(idx, field, val) {
    setEquipmentItems(items => items.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: val }
      if (field === 'qty' || field === 'rate') {
        // Auto-calculate total when qty or rate changes
        const qty = field === 'qty' ? val : item.qty
        const rate = field === 'rate' ? val : item.rate
        updated.total = qty * rate
      }
      return updated
    }))
  }

  function addEquipmentItem() {
    setEquipmentItems(items => [...items, BLANK_EQUIPMENT_ITEM()])
  }

  function removeEquipmentItem(idx) {
    setEquipmentItems(items => items.filter((_, i) => i !== idx))
  }

  function validate() {
    const e = {}
    if (!form.originLocation.trim()) e.originLocation = 'Required'
    if (!form.originDate) e.originDate = 'Required'
    if (!form.destinationLocation.trim()) e.destinationLocation = 'Required'
    if (!form.destinationDate) e.destinationDate = 'Required'
    if (!equipmentItems.length) e.equipmentItems = 'Add at least one equipment item'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const ticket = {
      id: genId('TKT-TRK'),
      type: 'TRUCKING',
      jobId,
      region: job.region,
      status: TICKET_STATUSES.PENDING_ALYA_REVIEW,
      fieldWorkerId: 'current-user',
      submittedAt: new Date().toISOString(),
      originLocation: form.originLocation.trim(),
      originDate: form.originDate,
      destinationLocation: form.destinationLocation.trim(),
      destinationDate: form.destinationDate,
      mileage: form.mileage ? parseFloat(form.mileage) : null,
      truckingMode: form.truckingMode,
      equipmentItems: equipmentItems.map(({ _key, ...rest }) => rest),
      notes: form.notes.trim(),
      billerNotes: '',
      approvalChain: [],
      exceptionFlags: [],
      signatureId: null,
      invoiceId: null,
    }

    dispatch({ type: CREATE_TICKET, payload: ticket })
    setSubmitted(ticket)
  }

  if (submitted) {
    return (
      <Card>
        <StatusBanner type="success">
          Trucking Ticket <strong>{submitted.id}</strong> submitted — pending Alya review.
        </StatusBanner>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button variant="ghost" onClick={() => {
            setSubmitted(null)
            setForm({
              originLocation: '',
              originDate: '',
              destinationLocation: '',
              destinationDate: '',
              mileage: '',
              truckingMode: 'flat',
              notes: '',
            })
            setEquipmentItems([BLANK_EQUIPMENT_ITEM()])
          }}>
            + New Trucking Ticket
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <StatusBanner type="info">
        <strong>v1.1 DEMO:</strong> Pricing is manual entry for now. v1.2 will pull rates from price books.
      </StatusBanner>

      <Card>
        <CardHeader title="Origin & Destination" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="grid-2">
            <FormField label="Origin Location" required error={errors.originLocation}>
              <Input
                value={form.originLocation}
                onChange={e => setF('originLocation', e.target.value)}
                placeholder="e.g. Staging Pad A"
              />
            </FormField>
            <FormField label="Origin Date" required error={errors.originDate}>
              <Input
                type="date"
                value={form.originDate}
                onChange={e => setF('originDate', e.target.value)}
              />
            </FormField>
          </div>
          <div className="grid-2">
            <FormField label="Destination Location" required error={errors.destinationLocation}>
              <Input
                value={form.destinationLocation}
                onChange={e => setF('destinationLocation', e.target.value)}
                placeholder="e.g. Well Site B"
              />
            </FormField>
            <FormField label="Destination Date" required error={errors.destinationDate}>
              <Input
                type="date"
                value={form.destinationDate}
                onChange={e => setF('destinationDate', e.target.value)}
              />
            </FormField>
          </div>
          <div className="grid-2">
            <FormField label="Mileage (optional)">
              <Input
                type="number"
                step="0.1"
                value={form.mileage}
                onChange={e => setF('mileage', e.target.value)}
                placeholder="e.g. 42.5"
              />
            </FormField>
            <FormField label="Trucking Mode (reference)">
              <Select value={form.truckingMode} onChange={e => setF('truckingMode', e.target.value)}>
                {TRUCKING_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={`Equipment Items (${equipmentItems.length})`}
          action={<Button variant="secondary" size="sm" type="button" onClick={addEquipmentItem}>+ Add Item</Button>}
        />
        {errors.equipmentItems && <StatusBanner type="error" className="mb-3">{errors.equipmentItems}</StatusBanner>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {equipmentItems.map((item, idx) => (
            <div key={item._key} style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              background: 'var(--bg)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>Item {idx + 1}</span>
                {equipmentItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEquipmentItem(idx)}
                    style={{ color: 'var(--status-flagged)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <FormField label="Description">
                  <Input
                    value={item.description}
                    onChange={e => updateEquipmentItem(idx, 'description', e.target.value)}
                    placeholder="e.g. Mud System Transport"
                  />
                </FormField>
                <div className="grid-2">
                  <FormField label="Qty">
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={e => updateEquipmentItem(idx, 'qty', parseFloat(e.target.value) || 0)}
                    />
                  </FormField>
                  <FormField label="Rate ($ — manual entry)">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.rate}
                      onChange={e => updateEquipmentItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </FormField>
                </div>
                <div style={{
                  padding: 'var(--space-3)',
                  background: 'var(--card)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Qty</div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{item.qty}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Rate</div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>${item.rate.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total</div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--navy)' }}>
                      ${(item.qty * item.rate).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Notes (Optional)" />
        <FormField label="Additional notes">
          <Textarea
            value={form.notes}
            onChange={e => setF('notes', e.target.value)}
            placeholder="Any additional information about this trucking event"
            rows={3}
          />
        </FormField>
      </Card>

      <div>
        <Button type="submit" variant="primary" size="lg" onClick={handleSubmit}>
          Submit Trucking Ticket
        </Button>
      </div>
    </div>
  )
}
