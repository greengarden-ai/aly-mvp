import { useState } from 'react'
import { priceBooks } from '../../data/priceBooks.js'
import Card, { CardHeader } from '../../components/common/Card.jsx'
import StatusBanner from '../../components/common/StatusBanner.jsx'

export default function PriceBooksScreen() {
  const [expandedCustomers, setExpandedCustomers] = useState({})

  function toggleCustomer(customerId) {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerId]: !prev[customerId],
    }))
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Price Books Reference</h1>
        <p className="page-subtitle">View customer pricing structures and rate matrices</p>
      </div>

      <StatusBanner type="info" className="mb-4">
        <strong>DEMO v1.1:</strong> This is a placeholder reference showing pricing structures extracted from PDFs. 
        Full price book management and editing coming in v1.2.
      </StatusBanner>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {Object.entries(priceBooks).map(([customerId, customer]) => (
          <Card key={customerId}>
            <button
              onClick={() => toggleCustomer(customerId)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--navy)' }}>
                  {customer.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                  Contact: {customer.contact}
                </div>
              </div>
              <div style={{ fontSize: 'var(--text-xl)', transition: 'transform 0.2s' }}>
                {expandedCustomers[customerId] ? '−' : '+'}
              </div>
            </button>

            {expandedCustomers[customerId] && (
              <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                {customer.rigs && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {Object.entries(customer.rigs).map(([rigKey, rig]) => (
                      <div key={rigKey} style={{ paddingLeft: 'var(--space-4)' }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>
                          Rig: {rig.name}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                          {Object.entries(rig).map(([rateKey, rateObj]) => {
                            if (rateKey === 'name') return null
                            return (
                              <div key={rateKey} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                  {rateKey.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                  {typeof rateObj.value === 'number' && rateObj.unit === 'range'
                                    ? `$${rateObj.value.toLocaleString()}-${rateObj.max.toLocaleString()} ${rateObj.unit}`
                                    : `$${rateObj.value.toLocaleString()}/${rateObj.unit}`}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {customer.locations && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {Object.entries(customer.locations).map(([locKey, location]) => (
                      <div key={locKey} style={{ paddingLeft: 'var(--space-4)' }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>
                          Location: {location.name}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                          {Object.entries(location).map(([rateKey, rateObj]) => {
                            if (rateKey === 'name') return null
                            return (
                              <div key={rateKey} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                  {rateKey.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                  ${rateObj.value.toLocaleString()}/{rateObj.unit}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
