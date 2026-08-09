import type { ComplianceCategory, ComplianceRecord, RecordWorkspace } from "./types"

export type ComplianceWorkspaceRecord = ComplianceRecord & { category: ComplianceCategory }

export function getRecordWorkspace(record: ComplianceRecord): RecordWorkspace {
  return record.workspace ?? (record.category === "Operations" ? "operations" : "compliance")
}

export function isOperationsRecord(record: ComplianceRecord) {
  return getRecordWorkspace(record) === "operations"
}

export function isComplianceRecord(record: ComplianceRecord): record is ComplianceWorkspaceRecord {
  return getRecordWorkspace(record) === "compliance" && record.category !== "Operations"
}
