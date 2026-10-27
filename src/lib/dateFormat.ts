export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  const datumDio = date.toLocaleDateString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const vrijemeDio = date.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${datumDio} u ${vrijemeDio}`
}
