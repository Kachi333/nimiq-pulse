export const LUNA_PER_NIM = 100_000

/** Only this module converts between Luna and NIM. */
export function lunaToNim(luna: number): number {
  return luna / LUNA_PER_NIM
}

export function nimToLuna(nim: number): number {
  return Math.round(nim * LUNA_PER_NIM)
}

const THIN = ' '

export function int(value: number): string {
  return value.toLocaleString('en-US').replace(/,/g, THIN)
}

export function nim(luna: number): string {
  const value = lunaToNim(luna)
  const formatted =
    value >= 1000
      ? int(Math.round(value))
      : value.toFixed(value % 1 === 0 ? 0 : 2)
  return `${formatted} NIM`
}

/** NQ16 085S…6GKB — first two groups, ellipsis, last group. */
export function shortAddress(address: string): string {
  const groups = address.split(' ')
  if (groups.length < 4) return address
  return `${groups[0]} ${groups[1]}…${groups[groups.length - 1]}`
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
