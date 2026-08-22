export default function Button({
  children,
  variant = 'primary',
  size,
  disabled,
  onClick,
  type = 'button',
  className = '',
  title,
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      className={cls}
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}
