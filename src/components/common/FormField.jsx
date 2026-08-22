export default function FormField({
  label,
  required,
  hint,
  error,
  children,
  className = '',
}) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className={`form-label${required ? ' required' : ''}`}>
          {label}
        </label>
      )}
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`form-input ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`form-input ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`form-input ${className}`} {...props} />
}
