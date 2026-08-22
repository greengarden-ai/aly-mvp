const ICONS = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '🚨' }

export default function StatusBanner({ type = 'info', children, className = '' }) {
  return (
    <div className={`banner banner-${type} ${className}`}>
      <span className="banner-icon">{ICONS[type]}</span>
      <div>{children}</div>
    </div>
  )
}
