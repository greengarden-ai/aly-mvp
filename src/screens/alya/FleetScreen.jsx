import { useState, useMemo } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { EQUIPMENT_STATUSES } from '../../data/constants.js'
import Badge from '../../components/common/Badge.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'

const STATUS_LABELS = {
  [EQUIPMENT_STATUSES.IN_YARD]:    'In Yard',
  [EQUIPMENT_STATUSES.ON_JOB]:     'On Job',
  [EQUIPMENT_STATUSES.SUB_RENTED]: 'Sub-Rented',
}

export default function FleetScreen() {
  const { state } = useAppState()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const counts = useMemo(() => ({
    IN_YARD:    state.equipment.filter(e => e.status === 'IN_YARD').length,
    ON_JOB:     state.equipment.filter(e => e.status === 'ON_JOB').length,
    SUB_RENTED: state.equipment.filter(e => e.status === 'SUB_RENTED').length,
  }), [state.equipment])

  const filtered = useMemo(() => {
    let items = state.equipment
    if (statusFilter !== 'ALL') items = items.filter(e => e.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.serialNumber?.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      )
    }
    return [...items].sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [state.equipment, statusFilter, search, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function SortHeader({ col, label }) {
    const active = sortKey === col
    return (
      <th onClick={() => toggleSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fleet & Equipment</h1>
        <p className="page-subtitle">Representing a 400-unit fleet concept — {state.equipment.length} items in this prototype</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'IN_YARD',    label: 'In Yard',     icon: '🏗️', color: 'var(--status-approved)' },
          { key: 'ON_JOB',     label: 'On Job',      icon: '🔧', color: 'var(--accent-dark)' },
          { key: 'SUB_RENTED', label: 'Sub-Rented',  icon: '🔄', color: '#6a1b9a' },
        ].map(({ key, label, icon, color }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'ALL' : key)}
            style={{
              background: statusFilter === key ? 'var(--navy)' : 'var(--card)',
              border: `2px solid ${statusFilter === key ? 'var(--navy)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 'var(--space-2)' }}>{icon}</div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: statusFilter === key ? 'var(--accent)' : color }}>
              {counts[key]}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: statusFilter === key ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          style={{ maxWidth: 280 }}
          placeholder="Search name, category, serial…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['ALL', 'IN_YARD', 'ON_JOB', 'SUB_RENTED'].map(f => (
            <button
              key={f}
              className={`btn btn-${statusFilter === f ? 'navy' : 'secondary'} btn-sm`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'ALL' ? `All (${state.equipment.length})` : `${STATUS_LABELS[f]} (${counts[f]})`}
            </button>
          ))}
        </div>
        {search && (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <SortHeader col="id"       label="ID" />
              <SortHeader col="name"     label="Name" />
              <SortHeader col="category" label="Category" />
              <th>Serial Number</th>
              <SortHeader col="status"   label="Status" />
              <th>Location / Job</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(eq => {
              const job = eq.jobId ? state.jobs.find(j => j.id === eq.jobId) : null
              return (
                <tr key={eq.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{eq.id}</td>
                  <td style={{ fontWeight: 600 }}>{eq.name}</td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    {eq.category?.replace(/_/g, ' ')}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{eq.serialNumber}</td>
                  <td><Badge status={eq.status} label={STATUS_LABELS[eq.status]} /></td>
                  <td style={{ fontSize: 'var(--text-sm)' }}>
                    {eq.status === 'ON_JOB' && job ? (
                      <span>{job.id} · {job.wellName}</span>
                    ) : eq.status === 'SUB_RENTED' ? (
                      <span style={{ color: 'var(--text-muted)' }}>External</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>{eq.location}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
          No equipment matches your filter.
        </div>
      )}
    </div>
  )
}
