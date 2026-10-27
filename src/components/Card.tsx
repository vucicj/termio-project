import type { ReactNode } from 'react'
import './Card.css'

function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>
}

export default Card
