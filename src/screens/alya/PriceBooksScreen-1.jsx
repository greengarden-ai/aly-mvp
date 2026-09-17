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
                          Rig: {rig.name || rigKey}
                        </div>
                        {rig.description && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                            {rig.description}
                          </div>
                        )}

                        {/* Daily Equipment */}
                        {rig.dailyEquipment && rig.dailyEquipment.length > 0 && (
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                              Daily Equipment
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                              {rig.dailyEquipment.map((item, idx) => (
                                <div key={idx} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                    {item.description}
                                  </div>
                                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                    ${item.rate}/{item.unit}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rig-up Services */}
                        {rig.rigup && (
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                              Rig-up Services
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                              {Object.entries(rig.rigup).map(([serviceKey, service]) => (
                                <div key={serviceKey} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                    {serviceKey.replace(/([A-Z])/g, ' $1').trim()}
                                  </div>
                                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                    ${service.rate.toLocaleString()} {service.unit}
                                  </div>
                                  {service.additionalPerTenMiles && (
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                                      +${service.additionalPerTenMiles}/10 mi
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Services (Hourly) */}
                        {rig.services && rig.services.length > 0 && (
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                              Services
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                              {rig.services.map((item, idx) => (
                                <div key={idx} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                    {item.description}
                                  </div>
                                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                    ${item.rate}/{item.unit}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sale Items */}
                        {rig.saleItems && rig.saleItems.length > 0 && (
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                              Sale Items
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                              {rig.saleItems.map((item, idx) => (
                                <div key={idx} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                    {item.description}
                                  </div>
                                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                    ${item.rate.toLocaleString()} {item.unit}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Washout */}
                        {rig.washout && rig.washout.length > 0 && (
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                              Washout
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                              {rig.washout.map((item, idx) => (
                                <div key={idx} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                    {item.description}
                                  </div>
                                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                    ${item.rate} {item.unit}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Disposal */}
                        {rig.disposal && rig.disposal.length > 0 && (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                              Disposal
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                              {rig.disposal.map((item, idx) => (
                                <div key={idx} style={{ background: 'var(--bg)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                    {item.description}
                                  </div>
                                  <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                    ${item.rate} {item.unit}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {customer.locations && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {Object.entries(customer.locations).map(([locKey, location]) => (
                      <div key={locKey} style={{ paddingLeft: 'var(--space-4)' }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>
                          Location: {location.name || locKey}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                          {Object.entries(location).map(([rateKey, rateObj]) => {
                            if (rateKey === 'name' || rateKey === 'description') return null
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
