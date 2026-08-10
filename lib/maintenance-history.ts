import type { MaintenanceRequest } from "@/lib/types"

type RepeatHistoryFields = Pick<
  MaintenanceRequest,
  "assetName" | "repeatIssueKey" | "repeatRepairCount" | "repeatRecordedCost" | "repeatRepairPeriodMonths"
>

export function hasPotentialRepeatHistory(request: RepeatHistoryFields) {
  return Boolean(
    request.assetName
      && request.repeatIssueKey
      && (request.repeatRepairCount ?? 0) >= 2
      && (request.repeatRecordedCost ?? 0) > 0
      && (request.repeatRepairPeriodMonths ?? 0) > 0
  )
}
