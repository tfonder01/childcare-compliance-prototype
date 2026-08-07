"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { ComplianceRecord, Comment, ActivityEvent, Notification, Role } from "./types"
import {
  RECORDS as INITIAL_RECORDS,
  COMMENTS as INITIAL_COMMENTS,
  ACTIVITY as INITIAL_ACTIVITY,
  NOTIFICATIONS as INITIAL_NOTIFICATIONS,
  USERS,
} from "./mock-data"

interface AppState {
  role: Role
  setRole: (role: Role) => void
  currentUser: (typeof USERS)[0]
  records: ComplianceRecord[]
  comments: Comment[]
  activity: ActivityEvent[]
  notifications: Notification[]
  updateRecordStatus: (id: string, status: ComplianceRecord["status"]) => void
  archiveRecord: (id: string) => void
  restoreRecord: (id: string) => void
  addRecord: (record: ComplianceRecord) => void
  addComment: (comment: Comment) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  unreadCount: number
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("owner")
  const [records, setRecords] = useState<ComplianceRecord[]>(INITIAL_RECORDS)
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [activity, setActivity] = useState<ActivityEvent[]>(INITIAL_ACTIVITY)
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS)

  const currentUser = role === "owner" ? USERS[0] : USERS[1]

  const setRole = useCallback((r: Role) => setRoleState(r), [])

  const addActivityEvent = useCallback(
    (event: Omit<ActivityEvent, "id">) => {
      setActivity((prev) => [
        { ...event, id: `act_${Date.now()}` },
        ...prev,
      ])
    },
    []
  )

  const updateRecordStatus = useCallback(
    (id: string, status: ComplianceRecord["status"]) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status, lastUpdated: new Date().toISOString().split("T")[0] } : r
        )
      )
      const record = records.find((r) => r.id === id)
      if (record) {
        addActivityEvent({
          recordId: id,
          type: "status_changed",
          user: currentUser.name,
          userId: currentUser.id,
          role: currentUser.role,
          timestamp: new Date().toISOString(),
          detail: `Status changed to ${status}.`,
        })
      }
    },
    [records, currentUser, addActivityEvent]
  )

  const archiveRecord = useCallback(
    (id: string) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "Archived", lastUpdated: new Date().toISOString().split("T")[0] } : r
        )
      )
      addActivityEvent({
        recordId: id,
        type: "archived",
        user: currentUser.name,
        userId: currentUser.id,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
        detail: "Record archived.",
      })
    },
    [currentUser, addActivityEvent]
  )

  const restoreRecord = useCallback(
    (id: string) => {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "New", lastUpdated: new Date().toISOString().split("T")[0] } : r
        )
      )
      addActivityEvent({
        recordId: id,
        type: "restored",
        user: currentUser.name,
        userId: currentUser.id,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
        detail: "Record restored from archive.",
      })
    },
    [currentUser, addActivityEvent]
  )

  const addRecord = useCallback(
    (record: ComplianceRecord) => {
      setRecords((prev) => [record, ...prev])
      addActivityEvent({
        recordId: record.id,
        type: "created",
        user: currentUser.name,
        userId: currentUser.id,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
        detail: "Record created.",
      })
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          type: "upload",
          title: "New record uploaded",
          message: `${currentUser.name} uploaded "${record.title}".`,
          timestamp: new Date().toISOString(),
          recordId: record.id,
          isRead: false,
        },
        ...prev,
      ])
    },
    [currentUser, addActivityEvent]
  )

  const addComment = useCallback(
    (comment: Comment) => {
      setComments((prev) => [...prev, comment])
      addActivityEvent({
        recordId: comment.recordId,
        type: "comment_added",
        user: currentUser.name,
        userId: currentUser.id,
        role: currentUser.role,
        timestamp: new Date().toISOString(),
        detail: "Comment added.",
      })
    },
    [currentUser, addActivityEvent]
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        records,
        comments,
        activity,
        notifications,
        updateRecordStatus,
        archiveRecord,
        restoreRecord,
        addRecord,
        addComment,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
