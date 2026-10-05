interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  return (
    <span className={`status-badge status-${normalizedStatus.toLowerCase()}`}>
      {normalizedStatus}
    </span>
  );
}

export default StatusBadge;