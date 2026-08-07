"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Upload, AlertCircle, FileText } from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import { Button } from "@/components/ui/button"
import { UploadModal } from "@/components/upload-modal"
import type { ComplianceCategory } from "@/lib/types"

const CATEGORY_ORDER: ComplianceCategory[] = [
  "Licensing",
  "Health & Safety Drills",
  "Child Files",
  "Staff Files",
  "CCIR / Critical Incidents",
  "Parent Complaints",
  "Staff Complaints",
]

export default function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { records, activity } = useApp()
  const [uploadOpen, setUploadOpen] = useState(false)

  const location = LOCATIONS.find((l) => l.id === id)

  if (!location) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Location not found.</p>
        <Link href="/locations">
          <Button variant="outline" size="sm">Back to Locations</Button>
        </Link>
      </div>
    )
  }

  const locRecords = records.filter((r) => r.locationId === id && r.status !== "Archived")
  const newCount = locRecords.filter((r) => r.status === "New").length
  const attentionCount = locRecords.filter((r) => r.status === "Needs Attention").length
  const reviewedCount = locRecords.filter((r) => r.status === "Reviewed").length

  const attentionRecords = locRecords.filter(
    (r) => r.status === "Needs Attention" || r.status === "New"
  )
  const recentRecords = [...locRecords]
    .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))
    .slice(0, 6)

  const recentActivity = activity
    .filter((a) => locRecords.some((r) => r.id === a.recordId))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5)

  // Category breakdown
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    count: locRecords.filter((r) => r.category === cat).length,
  })).filter((c) => c.count > 0)

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/locations"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Locations
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{location.name}</h1>
              <p className="text-sm text-muted-foreground">Director: {location.director}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{location.address}</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {location.phone}
                </span>
              </div>
            </div>
          </div>
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            Upload Record
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Active Records", value: locRecords.length, className: "bg-card" },
            { label: "New", value: newCount, className: "bg-blue-50" },
            { label: "Needs Attention", value: attentionCount, className: "bg-amber-50" },
            { label: "Reviewed", value: reviewedCount, className: "bg-emerald-50" },
          ].map(({ label, value, className }) => (
            <div key={label} className={`rounded-xl border border-border p-4 shadow-sm ${className}`}>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Needs Attention */}
            {attentionRecords.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm">
                <div className="flex items-center gap-2 border-b border-amber-200 px-5 py-3.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-semibold text-amber-800">
                    Needs Attention ({attentionRecords.length})
                  </h2>
                </div>
                <div className="divide-y divide-amber-100">
                  {attentionRecords.map((rec) => (
                    <Link
                      key={rec.id}
                      href={`/records/${rec.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-amber-100/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.category}</p>
                      </div>
                      <StatusBadge status={rec.status} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Records */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Recent Records</h2>
                <Link
                  href={`/records?location=${id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="divide-y divide-border">
                {recentRecords.length === 0 ? (
                  <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No records for this location yet.
                  </p>
                ) : (
                  recentRecords.map((rec) => (
                    <Link
                      key={rec.id}
                      href={`/records/${rec.id}`}
                      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{rec.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <CategoryBadge category={rec.category} className="text-[10px]" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(rec.uploadDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={rec.status} />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Category breakdown */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">By Category</h2>
              {byCategory.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">No records yet.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {byCategory.map(({ category, count }) => (
                    <div key={category} className="flex items-center justify-between gap-2">
                      <CategoryBadge category={category} className="text-[11px]" />
                      <span className="text-xs font-medium text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentActivity.map((evt) => (
                    <div key={evt.id} className="text-xs">
                      <p className="font-medium text-foreground leading-snug">{evt.detail}</p>
                      <p className="mt-0.5 text-muted-foreground">
                        {evt.user} &middot;{" "}
                        {new Date(evt.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} defaultLocationId={id} />
    </>
  )
}
