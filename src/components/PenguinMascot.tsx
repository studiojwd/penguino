interface PenguinMascotProps {
  compact?: boolean
  label?: string
}

const PenguinMascot = ({ compact = false, label = 'Penguino waving' }: PenguinMascotProps) => (
  <img
    alt={label}
    className={`penguin-placeholder ${compact ? 'penguin-placeholder--compact' : ''}`}
    decoding="async"
    src="/assets/penguino-wave.png"
  />
)

export default PenguinMascot
