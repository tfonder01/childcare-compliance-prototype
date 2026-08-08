"use client"

import Link from "next/link"
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function NeedsReviewPage() {
  const { records, updateRecordStatus, role } = useApp()
  const [now, setNow] = useState<number | null>(null)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  useEffect(() => setNow(Date.now()), [])

  const markReviewed = (recordId: string) => {
    setResolvingId(recordId)
    window.setTimeout(() => {
      updateRecordStatus(recordId, "Reviewed")
      setResolvingId(null)
    }, 160)
  }

  const queue = records
    .filter((r) => r.status === "New" || r.status === "Needs Attention")
    .sort((a, b) => {
      // Needs Attention first, then New; within each group, oldest first
      if (a.status === b.status) return a.uploadDate.localeCompare(b.uploadDate)
      return a.status === "Needs Attention" ? -1 : 1
    })

  const attentionCount = queue.filter((r) => r.status === "Needs Attention").length
  const newCount = queue.filter((r) => r.status === "New").length

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-sm">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">{attentionCount} Needs Attention</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-blue-800">{newCount} New Uploads</span>
        </div>
      </div>

      {/* Queue */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Review Queue ({queue.length})
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Records awaiting owner review, sorted by priority.
          </p>
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">All caught up</p>
              <p className="text-xs text-muted-foreground">No records currently need review.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Record
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                    Uploaded By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>
                  {role === "owner" && (
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queue.map((rec) => {
                  const location = LOCATIONS.find((l) => l.id === rec.locationId)
                  const daysAgo = Math.floor(
                    ((now ?? new Date(rec.uploadDate).getTime()) - new Date(rec.uploadDate).getTime()) / 86400000
                  )
                  return (
                    <tr
                      key={rec.id}
                      className="transition-[opacity,background-color] duration-150 hover:bg-muted/50 data-[resolving=true]:opacity-0"
                      data-resolving={resolvingId === rec.id}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-foreground leading-snug max-w-[220px] truncate">
                          {rec.title}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-foreground md:table-cell">
                        {location?.name ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3.5 lg:table-cell">
                        <CategoryBadge category={rec.category} />
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-muted-foreground md:table-cell">
                        {rec.uploadedBy}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs font-medium ${daysAgo >= 7 ? "text-red-600" : daysAgo >= 3 ? "text-amber-600" : "text-muted-foreground"}`}
                        >
                          {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={rec.status} />
                      </td>
                      {role === "owner" && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              onClick={() => markReviewed(rec.id)}
                              disabled={resolvingId === rec.id}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Reviewed
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-amber-700 hover:bg-amber-50"
                              onClick={() => updateRecordStatus(rec.id, "Needs Attention")}
                              disabled={rec.status === "Needs Attention"}
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                              Attention
                            </Button>
                          <Button
                            render={<Link href={`/records/${rec.id}`} />}
                            nativeButton={false}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label={`Open ${rec.title}`}
                          >
                              <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
