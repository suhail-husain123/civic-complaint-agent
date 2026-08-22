function PriorityBadge({ priority }) {
  if (!priority) {
    return null
  }

  const normalizedPriority =
    priority.toLowerCase()

  const label = priority
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    )

  return (
    <span
      className={`priority-badge priority-${normalizedPriority}`}
    >
      {label}
    </span>
  )
}

export default PriorityBadge