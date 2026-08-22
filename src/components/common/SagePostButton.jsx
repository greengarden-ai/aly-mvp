import { useState } from 'react'
import { useAppState } from '../../context/AppContext.jsx'
import { POST_INVOICE } from '../../context/actions.js'
import { genId, formatDateTime } from '../../utils.js'
import Button from './Button.jsx'

export default function SagePostButton({ invoice, disabled, disabledReason }) {
  const { dispatch } = useAppState()
  const [loading, setLoading] = useState(false)

  if (invoice?.status === 'POSTED') {
    return (
      <div style={{
        background: '#e8f5e9',
        border: '1px solid #a5d6a7',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <span style={{ fontWeight: 700, color: '#1b5e20', fontSize: 'var(--text-base)' }}>
            Posted to Sage Intacct
          </span>
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: '#2e7d32' }}>
          <div>Invoice ID: <strong>{invoice.intacctPostId}</strong></div>
          <div>Posted: {formatDateTime(invoice.intacctPostedAt)}</div>
        </div>
      </div>
    )
  }

  function handlePost() {
    setLoading(true)
    setTimeout(() => {
      const intacctPostId = `SI-${genId('INV')}`
      dispatch({
        type: POST_INVOICE,
        payload: {
          invoiceId: invoice.id,
          intacctPostId,
          postedAt: new Date().toISOString(),
        },
      })
      setLoading(false)
    }, 1200)
  }

  return (
    <div>
      <Button
        variant="navy"
        disabled={disabled || loading || !invoice}
        onClick={handlePost}
        title={disabledReason}
        size="lg"
      >
        {loading ? 'Posting…' : '📤 Post to Sage Intacct'}
      </Button>
      {disabledReason && (
        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {disabledReason}
        </div>
      )}
    </div>
  )
}
