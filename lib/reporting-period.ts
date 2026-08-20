import type { ReportingCadence, ReportingPeriod } from "./types"

export const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const

export const MONTH_OPTIONS = FULL_MONTHS.map((label, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label,
}))

/** Returns the ISO date (YYYY-MM-DD) of the Monday that starts the week containing `date`. */
export function startOfWeek(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  const day = parsed.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  parsed.setDate(parsed.getDate() + diffToMonday)
  return parsed.toISOString().slice(0, 10)
}

export function formatFullDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return `${FULL_MONTHS[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`
}

export function monthName(month: string): string {
  const index = Number(month) - 1
  return FULL_MONTHS[index] ?? ""
}

/** Human-readable label for a reporting period, e.g. "August 2026" or "Week of August 17, 2026". */
export function reportingPeriodLabel(period: ReportingPeriod | undefined): string {
  if (!period) return ""
  if (period.cadence === "WEEKLY" && period.weekOf) return `Week of ${formatFullDate(period.weekOf)}`
  if (period.cadence === "MONTHLY" && period.month && period.year) return `${monthName(period.month)} ${period.year}`
  return ""
}

/** Builds a ReportingPeriod from a record date, given the desired cadence. */
export function buildReportingPeriod(cadence: ReportingCadence, recordDate: string): ReportingPeriod {
  if (cadence === "WEEKLY") return { cadence, weekOf: startOfWeek(recordDate) }
  if (cadence === "MONTHLY") return { cadence, month: recordDate.slice(5, 7), year: recordDate.slice(0, 4) }
  return { cadence: "NONE" }
}
