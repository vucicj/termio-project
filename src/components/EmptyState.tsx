import type { LucideIcon } from 'lucide-react'
import './EmptyState.css'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-state__icon" aria-hidden="true" size={32} />
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  )
}

export default EmptyState
