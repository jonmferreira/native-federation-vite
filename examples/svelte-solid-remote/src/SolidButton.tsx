import { createSignal } from 'solid-js'

export default function SolidButton(props: { label?: string }) {
  const [count, setCount] = createSignal(0)
  return (
    <button
      style={{
        padding: '0.5rem 1rem',
        'border-radius': '6px',
        border: '1px solid #2c4f7c',
        background: '#2c4f7c',
        color: 'white',
        cursor: 'pointer'
      }}
      onClick={() => setCount(count() + 1)}
    >
      {props.label ?? 'Solid'} ({count()})
    </button>
  )
}
