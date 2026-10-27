import type { ReactNode } from 'react'
import './Badge.css'

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral'

type BadgeProps = {
  tone: BadgeTone
  children: ReactNode
}

function Badge({ tone, children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export default Badge
