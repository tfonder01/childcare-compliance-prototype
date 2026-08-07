export type Role = "owner" | "director"

export type RecordStatus = "New" | "Reviewed" | "Needs Attention" | "Archived"

export type ComplianceCategory =
  | "Licensing"
  | "Health & Safety Drills"
  | "Child Files"
  | "Staff Files"
  | "CCIR / Critical Incidents"
  | "Parent Complaints"
  | "Staff Complaints"

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
  category: ComplianceCategory
  status: RecordStatus
  uploadedBy: string
  uploadedById: string
  uploadDate: string
  lastUpdated: string
  description: string
  fileNames: string[]
  tags: string[]
  relatedRef?: string
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
  type: "upload" | "status_change" | "comment" | "attention"
  title: string
  message: string
  timestamp: string
  recordId?: string
  isRead: boolean
}

export interface User {
  id: string
  name: string
  role: Role
  locationId?: string
  initials: string
}
