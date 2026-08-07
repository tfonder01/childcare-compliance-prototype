/**
 * Format a date string or Date object in a stable, locale-independent way
 * so server-rendered HTML always matches client-rendered HTML.
 * Output examples: "Jan 5", "Jan 5, 2025", "Jan 5 · 2:34 PM"
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function fmtDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export function fmtDateShort(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function fmtDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  const hours = d.getUTCHours()
  const minutes = d.getUTCMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const h = hours % 12 || 12
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} · ${h}:${minutes} ${ampm}`
}

export function fmtTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  const hours = d.getUTCHours()
  const minutes = d.getUTCMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const h = hours % 12 || 12
  return `${h}:${minutes} ${ampm}`
}
