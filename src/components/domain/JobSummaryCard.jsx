import { useAppState } from '../../context/AppContext.jsx'
import Badge from '../common/Badge.jsx'
import { getCustomer } from '../../utils.js'

export default function JobSummaryCard({ job, compact = false }) {
  const { state } = useAppState()
  const customer = getCustomer(state.customers, job.customerId)

  if (compact) {
    return (
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 'var(--text-sm)' }}>{job.id}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{customer?.name ?? '—'}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{job.wellName}</span>
        <Badge status={job.region} label={job.region} />
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--navy)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4) var(--space-5)',
      color: 'var(--text-inverse)',
      marginBottom: 'var(--space-5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>
            JOB RECORD
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{job.id}</div>
          <div style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            {customer?.name ?? '—'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            background: 'rgba(245,166,35,0.2)',
            border: '1px solid rgba(245,166,35,0.4)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px 12px',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: 'var(--accent)',
            display: 'inline-block',
            marginBottom: 6,
          }}>{job.region}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.75)' }}>{job.wellName}</div>
        </div>
      </div>
      {job.notes && (
        <div style={{
          marginTop: 'var(--space-3)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          fontSize: 'var(--text-sm)',
          color: 'rgba(255,255,255,0.65)',
        }}>
          {job.notes}
        </div>
      )}
    </div>
  )
}
