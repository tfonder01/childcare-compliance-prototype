import type { MaintenancePriority } from "./types"

/**
 * Client requested renaming "Normal" to "Medium" in the UI. The persisted/internal value
 * remains "Normal" for backward compatibility with existing Maintenance and Supply Request
 * records; only the displayed label changes.
 */
export const PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  Low: "Low",
  Normal: "Medium",
  High: "High",
  Urgent: "Urgent",
}

export function priorityLabel(priority: MaintenancePriority): string {
  return PRIORITY_LABELS[priority]
}
