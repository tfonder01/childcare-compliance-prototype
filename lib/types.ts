export type Role = "owner" | "director" | "assistant_director"

export type RecordStatus = "New" | "Reviewed" | "Needs Attention" | "Archived"

export type ComplianceCategory =
  | "Licensing"
  | "Health & Safety Drills"
  | "Child Files"
  | "Staff Files"
  | "Classroom Observations"
  | "CCIR / Critical Incidents"
  | "Parent Complaints"
  | "Staff Complaints"

export type RecordCategory = ComplianceCategory | "Operations"
export type RecordWorkspace = "compliance" | "operations"

export type OperationsRecordType =
  | "Opening Checklist"
  | "Closing Checklist"
  | "Playground Checklist"
  | "Other Operations Record"

export type ClassroomAgeGroup =
  | "Infant"
  | "Toddler"
  | "Twaddler"
  | "Prepper"
  | "Preschool"

export interface Location {
  id: string
  name: string
  director: string
  directorId: string
  address: string
  phone: string
  capacity: number
}

export interface ComplianceRecord {
  id: string
  title: string
  locationId: string
  category: RecordCategory
  workspace?: RecordWorkspace
  recordType?: OperationsRecordType
  status: RecordStatus
  uploadedBy: string
  uploadedById: string
  uploadDate: string
  lastUpdated: string
  description: string
  fileNames: string[]
  tags: string[]
  relatedRef?: string
  classroomAgeGroup?: ClassroomAgeGroup
  observationMonth?: string
  area?: string
}

export interface ActivityEvent {
  id: string
  recordId: string
  type:
    | "created"
    | "edited"
    | "status_changed"
    | "comment_added"
    | "file_uploaded"
    | "archived"
    | "restored"
  user: string
  userId: string
  role: Role
  timestamp: string
  detail: string
}

export interface Comment {
  id: string
  recordId: string
  user: string
  userId: string
  role: Role
  text: string
  timestamp: string
  isUnread?: boolean
}

export interface Notification {
  id: string
  type: "upload" | "status_change" | "comment" | "attention" | "maintenance"
  title: string
  message: string
  timestamp: string
  recordId?: string
  source?: "records" | "maintenance"
  isRead: boolean
}

export interface User {
  id: string
  name: string
  role: Role
  locationId?: string
  initials: string
}

export type MaintenanceCategory =
  | "Plumbing"
  | "Electrical"
  | "HVAC"
  | "Appliance"
  | "Furniture / Fixture"
  | "Playground"
  | "Building / Facility"
  | "Safety"
  | "Cleaning / Sanitation"
  | "Other"

export type MaintenancePriority = "Low" | "Normal" | "High" | "Urgent"
export type MaintenanceApprovalStatus =
  | "Not Required"
  | "Awaiting Approval"
  | "Approved"
  | "Declined"
export type MaintenanceStatus =
  | "Submitted"
  | "Approved / Ready"
  | "In Progress"
  | "Waiting"
  | "Completed"
  | "Cancelled"

export interface MaintenanceAttachment {
  name: string
  uploadedAt: string
  uploadedBy: string
}

export interface MaintenanceRequest {
  id: string
  title: string
  description: string
  locationId: string
  classroomAgeGroup?: ClassroomAgeGroup
  area: string
  category: MaintenanceCategory
  priority: MaintenancePriority
  submittedBy: string
  submittedById: string
  createdAt: string
  lastUpdated: string
  approvalStatus: MaintenanceApprovalStatus
  maintenanceStatus: MaintenanceStatus
  approvalNote?: string
  needsMoreInfo?: boolean
  assignedTo?: string
  vendor?: string
  vendorContact?: string
  scheduledDate?: string
  estimatedCost?: number
  finalCost?: number
  completedAt?: string
  originalPhotos: MaintenanceAttachment[]
  completionPhotos: MaintenanceAttachment[]
  invoices: MaintenanceAttachment[]
  assetName?: string
  assetType?: string
  repeatIssueKey?: string
  repeatRepairCount?: number
  repeatRecordedCost?: number
  archived: boolean
}

export interface SupplyRequestDraft {
  id: string
  locationId: string
  classroomAgeGroup?: ClassroomAgeGroup
  requestedById: string
  items: Array<{ name: string; quantity: number }>
  status: "Draft" | "Submitted" | "Approved" | "Declined"
}
