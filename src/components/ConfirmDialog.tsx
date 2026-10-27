import Button from './Button'
import './ConfirmDialog.css'

type ConfirmDialogProps = {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Potvrdi',
  onConfirm,
  onCancel,
  busy,
}: ConfirmDialogProps) {
  return (
    <div className="confirm-dialog__overlay" role="presentation" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{description}</p>
        <div className="confirm-dialog__actions">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Odustani
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Obrada...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
