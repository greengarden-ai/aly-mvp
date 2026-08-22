import { formatDate, formatCurrency, daysBetween } from '../../utils.js'
import AgeIndicator from '../common/AgeIndicator.jsx'

export default function RentalStintRow({ stint, index, showTotal = true }) {
  const days = stint.endDate ? daysBetween(stint.startDate, stint.endDate) : null
  const total = days != null ? days * stint.dailyRate : null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr auto',
      gap: 'var(--space-3)',
      alignItems: 'center',
      padding: 'var(--space-3) var(--space-4)',
      background: index % 2 === 0 ? 'var(--bg)' : 'var(--card)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-sm)',
    }}>
      <div>
        <div style={{ fontWeight: 600 }}>Stint {index + 1}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
          {formatDate(stint.startDate)} → {stint.endDate ? formatDate(stint.endDate) : '—'}
        </div>
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Duration</div>
        <div style={{ fontWeight: 600 }}>
          {days != null ? `${days} day${days !== 1 ? 's' : ''}` : (
            <span style={{ color: 'var(--status-flagged)', fontWeight: 700 }}>OPEN</span>
          )}
        </div>
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Daily Rate</div>
        <div>{formatCurrency(stint.dailyRate)}/day</div>
      </div>
      {showTotal && (
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Total</div>
          <div style={{ fontWeight: 700, color: total != null ? 'var(--navy)' : 'var(--text-muted)' }}>
            {total != null ? formatCurrency(total) : '—'}
          </div>
        </div>
      )}
    </div>
  )
}
