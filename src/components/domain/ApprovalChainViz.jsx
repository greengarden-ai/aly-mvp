import { useAppState } from '../../context/AppContext.jsx'

const CHAIN_META = {
  ALYA:     { name: 'Alya Hidayatallah', role: 'CFO' },
  JAIME:    { name: 'Jaime Reyes',       role: 'STX Approver' },
  LINDSEY:  { name: 'Lindsey Tran',      role: 'STX Approver' },
  AARON:    { name: 'Aaron Griffith',    role: 'WTX Approver' },
  CUSTOMER: { name: 'Customer',          role: 'Signature' },
}

// Map ticket status → how many chain steps are done (after Biller)
function completedSteps(status) {
  const order = [
    'PENDING_APPROVER', 'APPROVER_APPROVED', 'PENDING_CFO',
    'CFO_APPROVED', 'PENDING_SIGNATURE', 'SIGNED', 'INVOICED',
  ]
  const idx = order.indexOf(status)
  if (idx < 0) return 0
  // APPROVER_APPROVED means regional step done
  // CFO_APPROVED means CFO step done
  // SIGNED means customer step done
  if (status === 'SIGNED' || status === 'INVOICED') return 999
  if (status === 'CFO_APPROVED' || status === 'PENDING_SIGNATURE') return 2
  if (status === 'APPROVER_APPROVED' || status === 'PENDING_CFO') return 1
  return 0
}

export default function ApprovalChainViz({ region, ticket }) {
  const { state } = useAppState()
  const chain = state.config.routingRules[region] ?? []
  const done = ticket ? completedSteps(ticket.status) : 0

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        minWidth: 'max-content',
        padding: 'var(--space-3) 0',
      }}>
        {chain.map((key, i) => {
          const meta = CHAIN_META[key] ?? { name: key, role: '' }
          const isComplete = i < done
          const isCurrent = i === done

          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{
                  width: 32,
                  height: 2,
                  background: isComplete ? 'var(--status-approved)' : 'var(--border)',
                }} />
              )}
              <div style={{ textAlign: 'center', minWidth: 100 }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  margin: '0 auto var(--space-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  background: isComplete
                    ? 'var(--status-approved)'
                    : isCurrent
                      ? 'var(--accent)'
                      : 'var(--border)',
                  color: isComplete || isCurrent ? 'white' : 'var(--text-muted)',
                  border: isCurrent ? '2px solid var(--accent-dark)' : 'none',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(245,166,35,0.2)' : 'none',
                }}>
                  {isComplete ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: isComplete ? 'var(--status-approved)' : isCurrent ? 'var(--accent-dark)' : 'var(--text)' }}>
                  {meta.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                  {meta.role}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
