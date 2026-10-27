import type { InputHTMLAttributes } from 'react'
import './Field.css'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  id: string
  error?: string
}

function Field({ label, id, error, ...props }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={Boolean(error)} {...props} />
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Field
