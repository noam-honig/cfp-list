import { ValidateFieldEvent } from "remult"

export function validateDate(_: any, event: ValidateFieldEvent<any, Date>) {
  if (!event.value || event.value.getFullYear() < 1900)
    throw new Error('Invalid Date')
}

export function formatDate(d: Date) {
  if (!d)
    return ''
  return d.toLocaleDateString('en-il', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  })
}