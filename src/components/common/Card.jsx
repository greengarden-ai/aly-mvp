export default function Card({ children, className = '', style }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action, children }) {
  return (
    <div className="card-header">
      {title && <span className="card-title">{title}</span>}
      {children}
      {action && <div>{action}</div>}
    </div>
  )
}
