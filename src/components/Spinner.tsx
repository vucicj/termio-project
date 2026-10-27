import './Spinner.css'

function Spinner({ label = 'Učitavanje...' }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}

export default Spinner
