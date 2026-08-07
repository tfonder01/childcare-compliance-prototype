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
  const { activity, records } = useApp()

  const sorted = [...activity].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // Group by date
  const grouped: Record<string, typeof sorted> = {}
  sorted.forEach((evt) => {
    const date = evt.timestamp.split("T")[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(evt)
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {Object.entries(grouped).map(([date, events]) => (
        <div key={date}>
          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {fmtDate(date)}
            </p>
            <div className="flex-1 border-t border-border" />
          </div>

          <div className="space-y-1">
            {events.map((evt, i) => {
              const config = EVENT_CONFIG[evt.type] ?? EVENT_CONFIG.created
              const Icon = config.icon
              const record = records.find((r) => r.id === evt.recordId)
              const location = record
                ? LOCATIONS.find((l) => l.id === record.locationId)
                : null
              const isLast = i === events.length - 1

              return (
                <div key={evt.id} className="relative flex gap-4">
                  {!isLast && (
                    <div className="absolute left-4 top-9 h-full w-px bg-border" />
                  )}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full z-10",
                      config.iconClass
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug">
                          {evt.detail}
                        </p>
                        {record && (
                          <Link
                            href={`/records/${record.id}`}
                            className="mt-0.5 text-xs text-primary hover:underline"
                          >
                            {record.title}
                          </Link>
                        )}
                        {location && (
                          <p className="text-[11px] text-muted-foreground">{location.name}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-foreground">{evt.user}</p>
                        <p className="text-[11px] capitalize text-muted-foreground">{evt.role}</p>
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
        </div>
      ))}
    </div>
  )
}
