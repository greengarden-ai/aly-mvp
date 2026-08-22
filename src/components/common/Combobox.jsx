import { useState, useRef, useEffect } from 'react'

/**
 * Searchable combobox — filters the option list as you type, but also
 * accepts free-form entry that isn't on the list.
 *
 * Props:
 *   options   string[]          — suggestion list
 *   value     string            — controlled value
 *   onChange  (string) => void  — called on every change (typed or selected)
 *   placeholder, className, ...inputProps forwarded to <input>
 */
export default function Combobox({
  options = [],
  value = '',
  onChange,
  placeholder,
  className = '',
  ...inputProps
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)

  // Sync when parent resets value (e.g. form clear)
  useEffect(() => { setQuery(value) }, [value])

  const filtered = query.trim()
    ? options.filter(opt =>
        String(opt).toLowerCase().includes(query.toLowerCase())
      )
    : options

  function handleChange(e) {
    const v = e.target.value
    setQuery(v)
    onChange?.(v)
    setOpen(true)
  }

  function handleSelect(opt) {
    const v = String(opt)
    setQuery(v)
    onChange?.(v)
    setOpen(false)
  }

  function handleBlur() {
    // Delay so a click/tap on an option fires before the dropdown closes
    setTimeout(() => setOpen(false), 150)
  }

  const showDropdown = open && filtered.length > 0

  return (
    <div style={{ position: 'relative' }}>
      <input
        className={`form-input ${className}`}
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        {...inputProps}
      />
      {showDropdown && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 150,
            maxHeight: 220,
            overflowY: 'auto',
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
          }}
        >
          {filtered.map((opt, i) => (
            <li
              key={i}
              role="option"
              onClick={() => handleSelect(opt)}
              style={{
                padding: '10px 12px',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                lineHeight: 1.3,
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {String(opt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
