import { useState, useMemo } from 'react'
import { initialUsers } from '../../data/users.js'
import { genId } from '../../utils.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import Button from '../../components/common/Button.jsx'
import Badge from '../../components/common/Badge.jsx'
import FormField, { Input, Select } from '../../components/common/FormField.jsx'
import Modal from '../../components/common/Modal.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'

const ALL_ROLES = ['CS Rep', 'Field Worker', 'Biller', 'Regional Approver', 'CFO / Super Admin']
const ALL_REGIONS = ['STX', 'WTX', 'All']

const BLANK_USER = { name: '', email: '', role: 'Field Worker', region: 'STX' }

function RoleBadge({ role }) {
  const map = {
    'CS Rep':            'badge-draft',
    'Field Worker':      'badge-pending',
    'Biller':            'badge-in-yard',
    'Regional Approver': 'badge-approved',
    'CFO / Super Admin': 'badge-on-job',
  }
  return <span className={`badge ${map[role] ?? 'badge-draft'}`}>{role}</span>
}

export default function SuperAdminScreen() {
  // Intentionally local state — does NOT flow into AppContext
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(BLANK_USER)
  const [addErrors, setAddErrors] = useState({})
  const [deactivatedNames, setDeactivatedNames] = useState([])

  const filtered = useMemo(() => {
    let list = users.filter(u => u.active)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    }
    if (roleFilter !== 'All') list = list.filter(u => u.role === roleFilter)
    return list
  }, [users, search, roleFilter])

  const counts = useMemo(() => {
    const active = users.filter(u => u.active)
    return {
      total: active.length,
      byRole: ALL_ROLES.reduce((acc, r) => ({ ...acc, [r]: active.filter(u => u.role === r).length }), {}),
    }
  }, [users])

  function startEdit(user) {
    setEditingId(user.id)
    setEditForm({ role: user.role, region: user.region })
  }

  function saveEdit(userId) {
    setUsers(us => us.map(u => u.id === userId ? { ...u, ...editForm } : u))
    setEditingId(null)
  }

  function deactivate(user) {
    setUsers(us => us.map(u => u.id === user.id ? { ...u, active: false } : u))
    setDeactivatedNames(n => [...n, user.name])
  }

  function validateAdd() {
    const e = {}
    if (!addForm.name.trim()) e.name = 'Required'
    if (!addForm.email.trim()) e.email = 'Required'
    else if (!addForm.email.includes('@')) e.email = 'Enter a valid email'
    return e
  }

  function handleAddUser() {
    const errs = validateAdd()
    if (Object.keys(errs).length) { setAddErrors(errs); return }
    setUsers(us => [...us, {
      id: genId('u'),
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      role: addForm.role,
      region: addForm.region,
      active: true,
    }])
    setAddOpen(false)
    setAddForm(BLANK_USER)
    setAddErrors({})
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 className="page-title">Super Admin</h1>
            <p className="page-subtitle">User management — changes here are self-contained and do not affect approval routing elsewhere in the demo</p>
          </div>
          <Button variant="primary" onClick={() => setAddOpen(true)}>+ Add User</Button>
        </div>
      </div>

      {deactivatedNames.length > 0 && (
        <StatusBanner type="warning" className="mb-5">
          <strong>{deactivatedNames[deactivatedNames.length - 1]}</strong> has been deactivated and removed from this list.
          Note: their name still appears in approval chains elsewhere in the demo (as designed).
        </StatusBanner>
      )}

      {/* Role breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'All', label: 'Total Active', count: counts.total },
          ...ALL_ROLES.map(r => ({ key: r, label: r, count: counts.byRole[r] ?? 0 })),
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(key)}
            style={{
              background: roleFilter === key ? 'var(--navy)' : 'var(--card)',
              border: `2px solid ${roleFilter === key ? 'var(--navy)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: roleFilter === key ? 'var(--accent)' : 'var(--navy)' }}>
              {count}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: roleFilter === key ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', lineHeight: 1.3 }}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* User table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Region</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const isEditing = editingId === user.id
              return (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    {isEditing ? (
                      <Select
                        value={editForm.role}
                        onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                        style={{ minWidth: 160 }}
                      >
                        {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </Select>
                    ) : (
                      <RoleBadge role={user.role} />
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <Select
                        value={editForm.region}
                        onChange={e => setEditForm(f => ({ ...f, region: e.target.value }))}
                        style={{ width: 90 }}
                      >
                        {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </Select>
                    ) : (
                      <span style={{
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-pill)', padding: '2px 10px',
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                      }}>{user.region}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {isEditing ? (
                        <>
                          <Button variant="primary" size="sm" onClick={() => saveEdit(user.id)}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => startEdit(user)}>Edit</Button>
                          {user.role !== 'CFO / Super Admin' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => deactivate(user)}
                              title="Deactivate user (local only)"
                            >
                              Deactivate
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No users match your search.
        </div>
      )}

      {/* Add User Modal */}
      {addOpen && (
        <Modal title="Add New User" onClose={() => { setAddOpen(false); setAddForm(BLANK_USER); setAddErrors({}) }} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <FormField label="Full Name" required error={addErrors.name}>
              <Input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="First Last" />
            </FormField>
            <FormField label="Email" required error={addErrors.email}>
              <Input type="email" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="name@aly-energy.example" />
            </FormField>
            <FormField label="Role" required>
              <Select value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}>
                {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </FormField>
            <FormField label="Region" required>
              <Select value={addForm.region} onChange={e => setAddForm(f => ({ ...f, region: e.target.value }))}>
                {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </FormField>
            <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
              <Button variant="primary" onClick={handleAddUser}>Add User</Button>
              <Button variant="ghost" onClick={() => { setAddOpen(false); setAddForm(BLANK_USER); setAddErrors({}) }}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
