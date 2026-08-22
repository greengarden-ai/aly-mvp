import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../../context/AppContext.jsx'
import { CREATE_TICKET } from '../../context/actions.js'
import { genId } from '../../utils.js'
import { TICKET_STATUSES } from '../../data/constants.js'
import { initialUsers } from '../../data/users.js'
import { approvedVendors } from '../../data/vendors.js'
import { ownedSerialsByType } from '../../data/fieldEquipmentSerials.js'
import { fleetVehicles } from '../../data/vehicles.js'
import Combobox from '../../components/common/Combobox.jsx'
import FormField from '../../components/common/FormField.jsx'
import { Textarea } from '../../components/common/FormField.jsx'
import Button from '../../components/common/Button.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'

// ── Local data derivations ────────────────────────────────────────────────────

const EMPLOYEES = initialUsers
  .filter(u => u.role === 'Field Worker' && u.active)
  .map(u => u.name)

const MANAGERS = initialUsers
  .filter(u => ['Regional Approver', 'CFO / Super Admin'].includes(u.role) && u.active)
  .map(u => u.name)

const KNOWN_EQUIP_TYPES = ['DMP', 'RBFOW', 'FB', 'EMMP', 'Containment', 'Other']

// Containment berm/barrier types — distinct from per-equipment containment style
const FT_CONTAINMENT_TYPES = ['Single', 'Double', 'Triple', 'Diesel', 'Chemical']

// ── Small shared sub-components ───────────────────────────────────────────────

function SectionCard({ num, title, children }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontWeight: 700,
        fontSize: 'var(--text-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--navy)',
      }}>
        <span style={{
          background: 'var(--navy)',
          color: 'white',
          width: 20, height: 20,
          borderRadius: '50%',
          fontSize: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{num}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

function Seg({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => !opt.disabled && onChange(opt.value)}
          style={{
            flex: 1,
            padding: '11px 8px',
            border: 'none',
            borderRight: i < options.length - 1 ? '1px solid var(--border)' : 'none',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: opt.disabled ? 'not-allowed' : 'pointer',
            background: value === opt.value
              ? 'var(--navy)'
              : opt.disabled ? '#f2f3f5' : 'var(--card)',
            color: value === opt.value
              ? 'white'
              : opt.disabled ? '#aab1bc' : 'var(--text-muted)',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function YesNo({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      {[{ v: true, label: 'Yes' }, { v: false, label: 'No' }].map(({ v, label }) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(v)}
          style={{
            flex: 1,
            padding: '10px',
            border: `1px solid ${value === v ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            background: value === v ? 'var(--accent-light)' : 'var(--card)',
            color: value === v ? 'var(--accent-dark)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ReadOnlyBox({ customer, lease, rig }) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px dashed var(--border-dark)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3) var(--space-4)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px 16px',
    }}>
      {[['Customer', customer], ['Lease', lease], ['Rig', rig]].map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 700 }}>{k}</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: v ? 'var(--navy)' : 'var(--border-dark)', marginTop: 2 }}>
            {v || '—'}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Equipment item helpers ────────────────────────────────────────────────────

const newEquipItem = () => ({
  _key: Math.random(),
  type: '',
  ownership: 'Aly Owned',
  serial: '',
  serialSub: '',
  vendor: '',
  containmentType: '',
  width: '',
  length: '',
  ownershipOther: 'Aly Owned',
  description: '',
  vendorOther: '',
})

function resolveEquipType(raw) {
  const matched = KNOWN_EQUIP_TYPES.find(t => t.toLowerCase() === raw.trim().toLowerCase())
  return matched || (raw.trim() ? 'Other' : '')
}

function EquipItemCard({ item, idx, onUpdate, onRemove }) {
  const resolved = resolveEquipType(item.type)
  const isPump = ['DMP', 'RBFOW', 'FB', 'EMMP'].includes(resolved)
  const serials = isPump ? (ownedSerialsByType[resolved] ?? []) : []

  function set(field, val) { onUpdate(idx, field, val) }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      {/* Row header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          background: '#e7ecf3',
          color: 'var(--navy)',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
        }}>
          Equipment #{idx + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--status-flagged)',
            fontSize: 'var(--text-xs)', fontWeight: 700,
            cursor: 'pointer', padding: '4px 6px',
          }}
        >
          Remove ✕
        </button>
      </div>

      {/* Equipment type */}
      <FormField label="Type of Equipment">
        <Combobox
          options={KNOWN_EQUIP_TYPES}
          value={item.type}
          onChange={v => set('type', v)}
          placeholder="Type to search or enter a type…"
        />
      </FormField>

      {/* DMP / RBFOW / FB / EMMP branch */}
      {isPump && (
        <>
          <FormField label="Ownership">
            <Seg
              options={[
                { value: 'Aly Owned', label: 'Aly Owned' },
                { value: 'Sub-Rented', label: 'Sub-Rented' },
              ]}
              value={item.ownership}
              onChange={v => set('ownership', v)}
            />
          </FormField>

          {item.ownership === 'Aly Owned' ? (
            <FormField label={`Serial Number (Aly Owned — ${resolved})`}>
              <Combobox
                options={serials}
                value={item.serial}
                onChange={v => set('serial', v)}
                placeholder="Type to search or enter a serial…"
              />
            </FormField>
          ) : (
            <>
              <FormField label="Serial Number (Sub-Rented)">
                <input
                  className="form-input"
                  value={item.serialSub}
                  onChange={e => set('serialSub', e.target.value)}
                  placeholder="e.g. RBFOW-114"
                />
              </FormField>
              <FormField label="Vendor Name">
                <input
                  className="form-input"
                  value={item.vendor}
                  onChange={e => set('vendor', e.target.value)}
                  placeholder="e.g. Byrd Rentals"
                />
              </FormField>
            </>
          )}
        </>
      )}

      {/* Containment branch */}
      {resolved === 'Containment' && (
        <>
          <FormField label="Containment Type">
            <Combobox
              options={FT_CONTAINMENT_TYPES}
              value={item.containmentType}
              onChange={v => set('containmentType', v)}
              placeholder="Type to search or enter a type…"
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <FormField label="Width">
              <input
                className="form-input"
                value={item.width}
                onChange={e => set('width', e.target.value)}
                placeholder="e.g. 40"
              />
            </FormField>
            <FormField label="Length">
              <input
                className="form-input"
                value={item.length}
                onChange={e => set('length', e.target.value)}
                placeholder="e.g. 100"
              />
            </FormField>
          </div>
        </>
      )}

      {/* Other branch (also catches unrecognized free-form types) */}
      {resolved === 'Other' && (
        <>
          <FormField label="Ownership">
            <Seg
              options={[
                { value: 'Aly Owned', label: 'Aly Owned' },
                { value: 'Sub-Rented', label: 'Sub-Rented' },
              ]}
              value={item.ownershipOther}
              onChange={v => set('ownershipOther', v)}
            />
          </FormField>
          <FormField label="Equipment Description">
            <input
              className="form-input"
              value={item.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the equipment…"
            />
          </FormField>
          {item.ownershipOther === 'Sub-Rented' && (
            <FormField label="Vendor Name">
              <input
                className="form-input"
                value={item.vendorOther}
                onChange={e => set('vendorOther', e.target.value)}
                placeholder="Vendor name…"
              />
            </FormField>
          )}
        </>
      )}
    </div>
  )
}

// ── Standby window row ────────────────────────────────────────────────────────

const newStandbyWindow = () => ({ _key: Math.random(), started: '', ended: '' })

function StandbyWindowCard({ win, idx, onChange, onRemove }) {
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          background: '#e7ecf3',
          color: 'var(--navy)',
          fontSize: 'var(--text-xs)', fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
        }}>
          Standby Window #{idx + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(idx)}
          style={{
            background: 'none', border: 'none',
            color: 'var(--status-flagged)',
            fontSize: 'var(--text-xs)', fontWeight: 700,
            cursor: 'pointer', padding: '4px 6px',
          }}
        >
          Remove ✕
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <FormField label="Standby Started">
          <input
            type="datetime-local"
            className="form-input"
            value={win.started}
            onChange={e => onChange(idx, 'started', e.target.value)}
          />
        </FormField>
        <FormField label="Standby Ended">
          <input
            type="datetime-local"
            className="form-input"
            value={win.ended}
            onChange={e => onChange(idx, 'ended', e.target.value)}
          />
        </FormField>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

const BLANK_FORM = {
  jobNumber: '',
  customer: '', lease: '', rig: '',
  crewSource: 'aly',
  alyEmployee: '',
  thirdPartyCompany: '',
  workType: 'Rig-Up',
  description: '',
  leftYard: '', arrivedAtLocation: '', leftLocation: '', returnedToYard: '',
  standby: false,
  vehicleNumber: '',
  mileageStart: '', mileageEnd: '',
  charge: true,
  approvalNotes: '',
  approved: true,
  approvingManager: '',
}

export default function FieldTicketScreen() {
  const { state, dispatch } = useAppState()
  const navigate = useNavigate()
  const [form, setForm] = useState(BLANK_FORM)
  const [equipItems, setEquipItems] = useState([newEquipItem()])
  const [standbyWindows, setStandbyWindows] = useState([])
  const [showJson, setShowJson] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  const jobNumbers = useMemo(
    () => state.jobs.map(j => j.jobNumber).filter(Boolean),
    [state.jobs]
  )

  // Auto-fill Customer/Lease/Rig when a known job number is typed
  const matchedJob = useMemo(
    () => state.jobs.find(j => j.jobNumber === form.jobNumber.trim()),
    [state.jobs, form.jobNumber]
  )

  useEffect(() => {
    if (matchedJob) {
      const cust = state.customers.find(c => c.id === matchedJob.customerId)
      setForm(f => ({
        ...f,
        customer: cust?.name || '',
        lease: matchedJob.lease || '',
        rig: matchedJob.rig || '',
      }))
    } else {
      setForm(f => ({ ...f, customer: '', lease: '', rig: '' }))
    }
  }, [matchedJob]) // eslint-disable-line react-hooks/exhaustive-deps

  function setF(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  // Equipment repeater
  function updateEquip(idx, field, val) {
    setEquipItems(items => items.map((item, i) =>
      i === idx ? { ...item, [field]: val } : item
    ))
  }
  function addEquip() { setEquipItems(items => [...items, newEquipItem()]) }
  function removeEquip(idx) { setEquipItems(items => items.filter((_, i) => i !== idx)) }

  // Standby window repeater
  function updateStandby(idx, field, val) {
    setStandbyWindows(ws => ws.map((w, i) => i === idx ? { ...w, [field]: val } : w))
  }
  function addStandby() {
    const ws = [...standbyWindows, newStandbyWindow()]
    setStandbyWindows(ws)
  }
  function removeStandby(idx) {
    setStandbyWindows(ws => ws.filter((_, i) => i !== idx))
  }

  // Turn standby on: seed one window if list is empty
  function handleStandbyToggle(on) {
    setF('standby', on)
    if (on && standbyWindows.length === 0) addStandby()
  }

  // ── Collect payload ──────────────────────────────────────────────────────────
  function collectPayload() {
    return {
      ticketType: 'field',
      jobNumber: form.jobNumber || null,
      customer: form.customer || null,
      lease: form.lease || null,
      rig: form.rig || null,
      crew: {
        source: form.crewSource === 'aly' ? 'Aly Employees' : '3rd Party',
        alyEmployee: form.crewSource === 'aly' ? (form.alyEmployee || null) : null,
        thirdPartyCompany: form.crewSource === '3rd' ? (form.thirdPartyCompany || null) : null,
      },
      workType: form.workType,
      equipment: equipItems.map(item => {
        const resolved = resolveEquipType(item.type)
        const isPump = ['DMP', 'RBFOW', 'FB', 'EMMP'].includes(resolved)
        const out = { type: item.type }
        if (isPump) {
          out.ownership = item.ownership
          if (item.ownership === 'Aly Owned') {
            out.serial = item.serial || null
          } else {
            out.serial = item.serialSub || null
            out.vendor = item.vendor || null
          }
        } else if (resolved === 'Containment') {
          out.containmentType = item.containmentType || null
          out.width = item.width || null
          out.length = item.length || null
        } else {
          out.ownership = item.ownershipOther
          out.description = item.description || null
          if (item.ownershipOther === 'Sub-Rented') {
            out.vendor = item.vendorOther || null
          }
        }
        return out
      }),
      visit: {
        description: form.description || null,
        leftYard: form.leftYard || null,
        arrivedAtLocation: form.arrivedAtLocation || null,
        leftLocation: form.leftLocation || null,
        returnedToYard: form.returnedToYard || null,
        standbyWindows: form.standby
          ? standbyWindows.map(w => ({ started: w.started || null, ended: w.ended || null }))
          : null,
        vehicleNumber: form.vehicleNumber || null,
        mileageStart: form.mileageStart || null,
        mileageEnd: form.mileageEnd || null,
      },
      managerApproval: {
        charge: form.charge,
        notes: form.approvalNotes || null,
        approved: form.approved,
        approvingManager: form.approvingManager || null,
      },
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  function handleSubmit() {
    const payload = collectPayload()
    const ticket = {
      id: genId('TKT-FT'),
      type: 'FIELD_TICKET',
      jobId: matchedJob?.id ?? null,
      region: matchedJob?.region ?? null,
      status: TICKET_STATUSES.PENDING_BILLER,
      fieldWorkerId: 'current-user',
      submittedAt: new Date().toISOString(),
      ...payload,
      billerNotes: '',
      approvalChain: [],
      exceptionFlags: [],
      signatureId: null,
      invoiceId: null,
    }
    dispatch({ type: CREATE_TICKET, payload: ticket })
    setSubmitted(ticket)
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ paddingBottom: 24 }}>
        <div className="page-header">
          <h1 className="page-title">Field Ticket</h1>
        </div>
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          maxWidth: 560,
        }}>
          <StatusBanner type="success">
            Ticket <strong>{submitted.id}</strong> submitted — pending Biller review.
          </StatusBanner>
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button variant="navy" onClick={() => navigate('/biller/tickets')}>→ Go to Biller Queue</Button>
            <Button variant="ghost" onClick={() => {
              setSubmitted(null)
              setForm(BLANK_FORM)
              setEquipItems([newEquipItem()])
              setStandbyWindows([])
            }}>
              + New Ticket
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        paddingBottom: 88,  /* space for fixed footer */
        maxWidth: 760,
      }}>

        {/* ── 1. Ticket Type ─────────────────────────────────────────────────── */}
        <SectionCard num={1} title="Ticket Type">
          <Seg
            options={[
              { value: 'field',    label: 'Field Ticket' },
              { value: 'trucking', label: 'Trucking Ticket', disabled: true },
              { value: 'service',  label: 'Service Ticket',  disabled: true },
            ]}
            value="field"
            onChange={() => {}}
          />
          <div style={{
            background: 'var(--accent-light)',
            border: '1px solid var(--border-dark)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
            fontSize: 'var(--text-xs)',
            color: 'var(--accent-dark)',
          }}>
            <strong>Note:</strong> Trucking Ticket and Service Ticket aren't outlined yet — content below is the Field Ticket flow only.
          </div>
        </SectionCard>

        {/* ── 2. Job Number ──────────────────────────────────────────────────── */}
        <SectionCard num={2} title="Job Number">
          <FormField label="Job Number">
            <Combobox
              options={jobNumbers}
              value={form.jobNumber}
              onChange={v => setF('jobNumber', v)}
              placeholder="Type to search or enter a job number…"
            />
          </FormField>
          <ReadOnlyBox
            customer={form.customer}
            lease={form.lease}
            rig={form.rig}
          />
        </SectionCard>

        {/* ── 3. Crew ────────────────────────────────────────────────────────── */}
        <SectionCard num={3} title="Crew">
          <FormField label="Crew Source">
            <Seg
              options={[
                { value: 'aly', label: 'Aly Employees' },
                { value: '3rd', label: '3rd Party' },
              ]}
              value={form.crewSource}
              onChange={v => setF('crewSource', v)}
            />
          </FormField>
          {form.crewSource === 'aly' ? (
            <FormField label="Employee">
              <Combobox
                options={EMPLOYEES}
                value={form.alyEmployee}
                onChange={v => setF('alyEmployee', v)}
                placeholder="Type to search or enter a name…"
              />
            </FormField>
          ) : (
            <FormField label="3rd Party Company">
              <Combobox
                options={approvedVendors}
                value={form.thirdPartyCompany}
                onChange={v => setF('thirdPartyCompany', v)}
                placeholder="Type to search or enter a company…"
              />
            </FormField>
          )}
        </SectionCard>

        {/* ── 4. Work Type ───────────────────────────────────────────────────── */}
        <SectionCard num={4} title="Work Type">
          <Seg
            options={[
              { value: 'Rig-Up',   label: 'Rig-Up' },
              { value: 'Rig-Down', label: 'Rig-Down' },
              { value: 'mud',      label: 'Mud Transfer', disabled: true },
            ]}
            value={form.workType}
            onChange={v => setF('workType', v)}
          />
          <div style={{
            background: 'var(--accent-light)',
            border: '1px solid var(--border-dark)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
            fontSize: 'var(--text-xs)',
            color: 'var(--accent-dark)',
          }}>
            <strong>Note:</strong> Mud Transfer isn't defined yet — placeholder only.
          </div>
        </SectionCard>

        {/* ── 5. Equipment ───────────────────────────────────────────────────── */}
        <SectionCard num={5} title="Equipment">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {equipItems.map((item, idx) => (
              <EquipItemCard
                key={item._key}
                item={item}
                idx={idx}
                onUpdate={updateEquip}
                onRemove={removeEquip}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addEquip}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: '2px dashed var(--accent)',
              background: 'var(--accent-light)',
              color: 'var(--accent-dark)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            + Add Equipment
          </button>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>
            {equipItems.length} added — no cap
          </div>
        </SectionCard>

        {/* ── 6. Visit Details ───────────────────────────────────────────────── */}
        <SectionCard num={6} title="Visit Details">
          <FormField label="Description of Work Performed">
            <Textarea
              value={form.description}
              onChange={e => setF('description', e.target.value)}
              placeholder="e.g. Rigged up (7) RBFOW tanks, containment, and DMP-5 pump on new location…"
              rows={3}
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }} className="mobile-stack">
            <FormField label="Left Yard">
              <input type="datetime-local" className="form-input" value={form.leftYard} onChange={e => setF('leftYard', e.target.value)} />
            </FormField>
            <FormField label="Arrived at Location">
              <input type="datetime-local" className="form-input" value={form.arrivedAtLocation} onChange={e => setF('arrivedAtLocation', e.target.value)} />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }} className="mobile-stack">
            <FormField label="Left Location">
              <input type="datetime-local" className="form-input" value={form.leftLocation} onChange={e => setF('leftLocation', e.target.value)} />
            </FormField>
            <FormField label="Returned to Yard">
              <input type="datetime-local" className="form-input" value={form.returnedToYard} onChange={e => setF('returnedToYard', e.target.value)} />
            </FormField>
          </div>

          <FormField label="Standby Time?">
            <YesNo value={form.standby} onChange={handleStandbyToggle} />
          </FormField>

          {form.standby && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {standbyWindows.map((win, idx) => (
                <StandbyWindowCard
                  key={win._key}
                  win={win}
                  idx={idx}
                  onChange={updateStandby}
                  onRemove={removeStandby}
                />
              ))}
              <button
                type="button"
                onClick={addStandby}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '2px dashed var(--accent)',
                  background: 'var(--accent-light)',
                  color: 'var(--accent-dark)',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                + Add Standby Window
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-3)' }} className="mobile-stack">
            <FormField label="Vehicle Number">
              <Combobox
                options={fleetVehicles}
                value={form.vehicleNumber}
                onChange={v => setF('vehicleNumber', v)}
                placeholder="Type to search or enter a vehicle #…"
              />
            </FormField>
            <FormField label="Beginning Mileage">
              <input
                type="number"
                className="form-input"
                value={form.mileageStart}
                onChange={e => setF('mileageStart', e.target.value)}
                placeholder="0"
              />
            </FormField>
            <FormField label="Ending Mileage">
              <input
                type="number"
                className="form-input"
                value={form.mileageEnd}
                onChange={e => setF('mileageEnd', e.target.value)}
                placeholder="0"
              />
            </FormField>
          </div>
        </SectionCard>

        {/* ── 7. Manager Approval ────────────────────────────────────────────── */}
        <SectionCard num={7} title="Manager Approval">
          <FormField label="Charge?">
            <YesNo value={form.charge} onChange={v => setF('charge', v)} />
          </FormField>

          <FormField label="Notes">
            <Textarea
              value={form.approvalNotes}
              onChange={e => setF('approvalNotes', e.target.value)}
              placeholder="Manager notes…"
              rows={2}
            />
          </FormField>

          <FormField label="Approved?">
            <YesNo value={form.approved} onChange={v => setF('approved', v)} />
          </FormField>

          <FormField label="Approving Manager">
            <Combobox
              options={MANAGERS}
              value={form.approvingManager}
              onChange={v => setF('approvingManager', v)}
              placeholder="Type to search or enter a manager…"
            />
          </FormField>
        </SectionCard>

      </div>

      {/* ── Fixed bottom action bar ───────────────────────────────────────────── */}
      <div className="ft-footer">
        <div style={{
          maxWidth: 760,
          margin: '0 auto',
          display: 'flex',
          gap: 'var(--space-3)',
        }}>
          <button
            type="button"
            onClick={() => setShowJson(true)}
            style={{
              padding: '13px 18px',
              background: '#eceef2',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              cursor: 'pointer',
              color: 'var(--navy)',
              flexShrink: 0,
            }}
          >
            View Data
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '13px 16px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              cursor: 'pointer',
              color: 'var(--navy)',
            }}
          >
            Submit Field Ticket
          </button>
        </div>
      </div>

      {/* ── JSON preview bottom sheet ─────────────────────────────────────────── */}
      {showJson && (
        <div
          onClick={() => setShowJson(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(20,25,35,0.55)',
            zIndex: 400,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f1720',
              color: '#c9e6c2',
              width: '100%',
              maxWidth: 760,
              maxHeight: '78vh',
              overflowY: 'auto',
              borderRadius: '14px 14px 0 0',
              padding: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                Live form data (shape that would be submitted)
              </span>
              <button
                type="button"
                onClick={() => setShowJson(false)}
                style={{ background: 'none', border: 'none', color: '#9aa7b5', fontSize: 20, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <pre style={{
              fontSize: 11.5,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              color: '#c9e6c2',
            }}>
              {JSON.stringify(collectPayload(), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* ── Scoped CSS ───────────────────────────────────────────────────────── */}
      <style>{`
        .ft-footer {
          position: fixed;
          bottom: 0;
          left: var(--sidebar-width);
          right: 0;
          background: white;
          border-top: 1px solid var(--border);
          padding: 12px 14px;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.06);
          z-index: 50;
        }
        @media (max-width: 768px) {
          .ft-footer { left: 0; }
          .mobile-stack { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
