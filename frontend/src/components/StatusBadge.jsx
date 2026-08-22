function StatusBadge({ status }) {
  if (!status) {
    return null
  }

  const normalizedStatus = status
    .toLowerCase()
    .replaceAll("_", "-")

  const label = status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )

  return (
    <span
      className={`badge status-${normalizedStatus}`}
    >
      {label}
    </span>
  )
}

export default StatusBadge