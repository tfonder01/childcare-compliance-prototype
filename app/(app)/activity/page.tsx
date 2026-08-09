"use client"

import Link from "next/link"
import {
  FileText,
  RefreshCw,
  CheckCircle2,
  Send,
  Archive,
  RotateCcw,
  Upload,
} from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { fmtDate, fmtTime } from "@/lib/format-date"
import { getRecordWorkspace } from "@/lib/record-workspaces"

const EVENT_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; iconClass: string }
> = {
  created: { icon: Upload, label: "Record created", iconClass: "bg-blue-100 text-blue-600" },
  edited: { icon: RefreshCw, label: "Record edited", iconClass: "bg-slate-100 text-slate-600" },
  status_changed: { icon: CheckCircle2, label: "Status changed", iconClass: "bg-emerald-100 text-emerald-600" },
  comment_added: { icon: Send, label: "Comment added", iconClass: "bg-violet-100 text-violet-600" },
  file_uploaded: { icon: FileText, label: "File uploaded", iconClass: "bg-sky-100 text-sky-600" },
  archived: { icon: Archive, label: "Archived", iconClass: "bg-slate-100 text-slate-500" },
  restored: { icon: RotateCcw, label: "Restored", iconClass: "bg-teal-100 text-teal-600" },
}

export default function ActivityPage() {
  const { activity, records, maintenanceRequests } = useApp()

  const sorted = [...activity].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // Group by date
  const grouped: Record<string, typeof sorted> = {}
  sorted.forEach((evt) => {
    const date = evt.timestamp.split("T")[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(evt)
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {sorted.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No recent activity</p>
          <p className="mt-1 text-xs text-muted-foreground">Record changes and comments will appear here.</p>
        </div>
      )}
      {Object.entries(grouped).map(([date, events]) => (
        <section key={date} className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:px-6">
          <div className="mb-4 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {fmtDate(date)}
            </p>
            <div className="flex-1 border-t border-border" />
          </div>

          <div className="space-y-0.5">
            {events.map((evt, i) => {
              const config = EVENT_CONFIG[evt.type] ?? EVENT_CONFIG.created
              const Icon = config.icon
              const record = records.find((r) => r.id === evt.recordId)
              const maintenanceRequest = maintenanceRequests.find((request) => request.id === evt.recordId)
              const entity = record ?? maintenanceRequest
              const location = entity
                ? LOCATIONS.find((l) => l.id === entity.locationId)
                : null
              const isLast = i === events.length - 1

              return (
                <div key={evt.id} className="interactive-row relative -mx-2 flex gap-4 rounded-lg px-2 pt-1">
                  {!isLast && (
                    <div className="absolute left-6 top-9 h-full w-px bg-border" />
                  )}
                  <div
                    className={cn(
                      "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                      config.iconClass
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {evt.detail}
                        </p>
                        {record && (
                          <Link
                            href={`/records/${record.id}`}
                            className="rounded-sm text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {record.title}
                          </Link>
                        )}
                        {maintenanceRequest && (
                          <Link
                            href={`/maintenance/${maintenanceRequest.id}`}
                            className="rounded-sm text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {maintenanceRequest.title}
                          </Link>
                        )}
                        {location && (
                          <p className="text-[11px] text-muted-foreground">
                            {location.name} &middot; {maintenanceRequest ? "Maintenance" : record && getRecordWorkspace(record) === "operations" ? "Operations" : "Compliance"}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-left sm:block sm:text-right">
                        <p className="text-xs font-medium text-foreground">{evt.user}</p>
                        <p className="text-[11px] capitalize text-muted-foreground">{evt.role.replace("_", " ")}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {fmtTime(evt.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
