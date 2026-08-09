"use client"

import Link from "next/link"
import { Archive, RotateCcw, ExternalLink } from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS } from "@/lib/mock-data"
import { CategoryBadge } from "@/components/category-badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { getRecordWorkspace } from "@/lib/record-workspaces"
import { WorkspaceBadge } from "@/components/workspace-badge"

export default function ArchivedPage() {
  const { records, activity, restoreRecord, role } = useApp()
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const handleRestore = (recordId: string) => {
    setRestoringId(recordId)
    window.setTimeout(() => {
      restoreRecord(recordId)
      setRestoringId(null)
    }, 160)
  }

  const archived = records.filter((r) => r.status === "Archived")

  // Get who archived each record
  const getArchiveEvent = (recordId: string) => {
    return activity
      .filter((a) => a.recordId === recordId && a.type === "archived")
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Archive</strong> — Records are never permanently deleted. Owners and admins can
        restore archived records at any time.
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Archived Records ({archived.length})
          </h2>
        </div>

        {archived.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Archive className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No archived records.</p>
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
                    Workspace / Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                    Archived By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">
                    Archive Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {archived.map((rec) => {
                  const location = LOCATIONS.find((l) => l.id === rec.locationId)
                  const archiveEvent = getArchiveEvent(rec.id)
                  return (
                    <tr
                      key={rec.id}
                      className="opacity-75 transition-[opacity,background-color] duration-150 hover:bg-muted/50 hover:opacity-100 data-[restoring=true]:opacity-0"
                      data-restoring={restoringId === rec.id}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-foreground max-w-[220px] truncate">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.uploadedBy}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {rec.category === "Operations" ? `Operations · ${rec.recordType ?? "Operations Record"}` : `Compliance · ${rec.category}`}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-foreground md:table-cell">
                        {location?.name ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3.5 lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          <WorkspaceBadge workspace={getRecordWorkspace(rec)} />
                          {rec.category !== "Operations" && <CategoryBadge category={rec.category} />}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-muted-foreground md:table-cell">
                        {archiveEvent?.user ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-muted-foreground md:table-cell">
                        {archiveEvent
                          ? new Date(archiveEvent.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : new Date(rec.lastUpdated).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {role === "owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-primary hover:bg-primary/10"
                              onClick={() => handleRestore(rec.id)}
                              disabled={restoringId === rec.id}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Restore
                            </Button>
                          )}
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
