import { getStatusInfo } from '../../lib/utils'

export default function StatusBadge({ status }) {
  const info = getStatusInfo(status)
  return (
    <span className={`badge ring-1 ring-inset ${info.color}`}>
      {info.label}
    </span>
  )
}