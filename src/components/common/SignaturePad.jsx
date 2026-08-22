import { useRef, useEffect, useState } from 'react'
import Button from './Button.jsx'

export default function SignaturePad({ onConfirm }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [hasStrokes, setHasStrokes] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#1A1F2E'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e) {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function draw(e) {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    if (!hasStrokes) setHasStrokes(true)
  }

  function endDraw() { drawing.current = false }

  function clear() {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setHasStrokes(false)
  }

  function confirm() {
    onConfirm(canvasRef.current.toDataURL('image/png'))
  }

  return (
    <div>
      <div style={{
        border: '1.5px dashed var(--border-dark)',
        borderRadius: 'var(--radius-md)',
        background: '#fafbfc',
        position: 'relative',
        marginBottom: 'var(--space-3)',
      }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        {!hasStrokes && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 'var(--text-sm)',
            pointerEvents: 'none',
          }}>
            Sign here
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button variant="secondary" size="sm" onClick={clear}>Clear</Button>
        <Button variant="navy" disabled={!hasStrokes} onClick={confirm}>
          Confirm Signature
        </Button>
      </div>
    </div>
  )
}
