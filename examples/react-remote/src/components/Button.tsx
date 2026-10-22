import { useState } from 'react'

export interface ButtonProps {
  label?: string
}

export default function Button({ label = 'Click me' }: ButtonProps) {
  const [clicks, setClicks] = useState(0)
  return (
    <button
      style={{
        padding: '0.5rem 1rem',
        borderRadius: 6,
        border: '1px solid #61dafb',
        background: '#61dafb',
        color: '#0b1020',
        cursor: 'pointer'
      }}
      onClick={() => setClicks((c) => c + 1)}
    >
      {label} ({clicks})
    </button>
  )
}
