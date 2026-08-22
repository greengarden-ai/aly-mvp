import Badge from '../common/Badge.jsx'

export default function EquipmentRow({ item, showJob = false }) {
  const hasTrucking = item.hasTruckingForm ?? true

  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.name ?? item.description}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.serialNumber ?? item.id}</div>
      </td>
      {item.category && <td style={{ fontSize: 'var(--text-sm)' }}>{item.category?.replace(/_/g, ' ')}</td>}
      {item.ownership !== undefined && (
        <td>
          <span style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '2px 8px',
            fontSize: 'var(--text-xs)', fontWeight: 600,
          }}>{item.ownership}</span>
        </td>
      )}
      {item.containmentType !== undefined && (
        <td style={{ fontSize: 'var(--text-sm)' }}>
          {item.containmentType} {item.containmentSize && `· ${item.containmentSize}`}
        </td>
      )}
      {item.hasTruckingForm !== undefined && (
        <td>
          <span style={{ color: hasTrucking ? 'var(--status-approved)' : 'var(--status-flagged)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
            {hasTrucking ? '✓ Yes' : '✗ Missing'}
          </span>
        </td>
      )}
      <td>
        <Badge
          status={item.status}
          label={item.status?.replace(/_/g, ' ')}
        />
      </td>
      {showJob && <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{item.jobId ?? '—'}</td>}
    </tr>
  )
}
