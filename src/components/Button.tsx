import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
}

function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ')
  return <button className={classes} {...props} />
}

export default Button
