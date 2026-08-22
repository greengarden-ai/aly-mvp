export default function AgeIndicator({ daysOpen }) {
  const color =
    daysOpen > 30 ? 'var(--age-critical)' :
    daysOpen > 15 ? 'var(--age-warn)' :
    'var(--age-ok)'

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color,
    }}>
      <span>⏱</span>
      {daysOpen}d open
    </span>
  )
}
