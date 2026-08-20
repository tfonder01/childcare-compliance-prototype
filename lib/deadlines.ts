import type { ComplianceRecord, ReportingCadence, SubmissionStatus } from "./types"

/**
 * Deadline / overdue derivation foundation (reminders sprint prep).
 *
 * UNRESOLVED BUSINESS RULE: the client has not yet confirmed exact due-day rules for
 * recurring submissions (e.g. "checklists are due by end of the reporting week" vs.
 * "by the following Monday"). The grace periods below are placeholder assumptions only,
 * kept in one place so they can be adjusted once the client confirms real rules. Nothing
 * downstream should hard-code these numbers directly.
 *
 * A full "expected submissions" schedule (e.g. exactly which checklists/observations are
 * required per location/classroom/week) is not modeled yet because those requirements have
 * not been confirmed by the client. What CAN be derived honestly from data already in the
 * app is: among records that already carry a reporting period, which ones are past their
 * derived due date and still outstanding (not yet Reviewed). That is what the helpers below
 * compute; they never fabricate a total "expected" count.
 */
/**
 * Whether recurring-submission due-day/grace-period business rules have been confirmed
 * (or made client-configurable) and are safe to present as an authoritative production
 * metric. This is intentionally `false` until the client confirms real rules — see the
 * module doc above. Flip to `true` (or replace with real config) once that happens; no
 * other code should need to change, since `countOverdueRecurringRecords` already computes
 * the real derived value either way.
 *
 * Demo/mock mode is exempt from this gate — it may keep illustrating the future overdue
 * metric using the placeholder rules below, since it is clearly not production data.
 */
export const DEADLINE_RULES_CONFIRMED = false

export const DEFAULT_GRACE_DAYS: Record<ReportingCadence, number> = {
  WEEKLY: 2,
  MONTHLY: 5,
  NONE: 0,
}

/** "Due soon" window before the due date, in days. Placeholder pending client confirmation. */
export const DUE_SOON_WINDOW_DAYS = 2

function endOfWeek(weekOf: string): Date {
  const start = new Date(`${weekOf}T00:00:00`)
  start.setDate(start.getDate() + 6)
  return start
}

function endOfMonth(month: string, year: string): Date {
  const monthIndex = Number(month) // 1-12
  return new Date(Number(year), monthIndex, 0) // day 0 of next month = last day of this month
}

function periodStartDate(record: ComplianceRecord): string | undefined {
  const period = record.reportingPeriod
  if (!period || period.cadence === "NONE") return undefined
  if (period.cadence === "WEEKLY") return period.weekOf
  if (period.cadence === "MONTHLY" && period.month && period.year) return `${period.year}-${period.month}-01`
  return undefined
}

/** Derives the due date for a reporting period given its cadence, using DEFAULT_GRACE_DAYS. */
export function computeDueDate(cadence: ReportingCadence, periodStart: string): Date | null {
  if (cadence === "NONE") return null
  const grace = DEFAULT_GRACE_DAYS[cadence]
  const periodEnd = cadence === "WEEKLY" ? endOfWeek(periodStart) : endOfMonth(periodStart.slice(5, 7), periodStart.slice(0, 4))
  const due = new Date(periodEnd)
  due.setDate(due.getDate() + grace)
  return due
}

export function deriveSubmissionStatus({
  dueDate,
  isSubmitted,
  now = new Date(),
}: {
  dueDate: Date | null
  isSubmitted: boolean
  now?: Date
}): SubmissionStatus {
  if (isSubmitted) return "Submitted"
  if (!dueDate) return "Upcoming"
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000)
  if (daysUntilDue < 0) return "Overdue"
  if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) return "Due Soon"
  return "Upcoming"
}

/**
 * Counts recurring (weekly/monthly) records that are past their derived due date and have
 * not yet been marked Reviewed. This intentionally reuses only real record data (reporting
 * period + review status) rather than a fabricated "expected submissions" total.
 */
export function countOverdueRecurringRecords(records: ComplianceRecord[], now = new Date()): number {
  return records.filter((record) => {
    if (record.status === "Archived" || record.status === "Reviewed") return false
    const start = periodStartDate(record)
    if (!start || !record.reportingPeriod) return false
    const dueDate = computeDueDate(record.reportingPeriod.cadence, start)
    return deriveSubmissionStatus({ dueDate, isSubmitted: false, now }).valueOf() === "Overdue"
  }).length
}
