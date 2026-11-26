export const currency = (amount: number) => new Intl.NumberFormat('es-DO', {
  style: 'currency',
  currency: 'DOP',
  maximumFractionDigits: 0,
}).format(amount).replace('DOP', 'RD$')

export const shortTime = (date: string) => new Intl.DateTimeFormat('es-DO', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(date))

export const tableLabel = (tableId: string) => `Mesa ${tableId.split('-').at(-1)?.padStart(2, '0') ?? tableId}`
