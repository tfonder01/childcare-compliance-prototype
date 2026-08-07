"use client"

import Link from "next/link"
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  MapPin,
} from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import type { ComplianceCategory } from "@/lib/types"
import { useState, useEffect } from "react"

const CATEGORY_ORDER: ComplianceCategory[] = [
  "Licensing",
  "Health & Safety Drills",
  "Child Files",
  "Staff Files",
  "CCIR / Critical Incidents",
  "Parent Complaints",
  "Staff Complaints",
]

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  href,
}: {
  label: string
  value: number
  icon: React.ElementType
  iconClassName: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClassName}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </Link>
  )
}

export default function DashboardPage() {
  const { records, activity, role } = useApp()
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { setNow(Date.now()) }, [])

  const activeRecords = records.filter((r) => r.status !== "Archived")
  const newUploads = records.filter((r) => r.status === "New").length
  const needsAttention = records.filter((r) => r.status === "Needs Attention").length
  // Use the most recent month present in the data as "current month"
  const mostRecentDate = records.reduce((latest, r) => {
    return r.lastUpdated > latest ? r.lastUpdated : latest
  }, "")
  const mostRecentMonth = mostRecentDate ? mostRecentDate.slice(0, 7) : ""
  const reviewedThisMonth = records.filter((r) => {
    if (r.status !== "Reviewed") return false
    return r.lastUpdated.startsWith(mostRecentMonth)
  }).length
  const upcoming = 2 // mock: upcoming items

  const recentUploads = [...records]
    .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))
    .slice(0, 5)

  const needsReviewRecords = records
    .filter((r) => r.status === "New" || r.status === "Needs Attention")
    .slice(0, 5)

  const recentActivity = [...activity]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6)

  // Records by location
  const byLocation = LOCATIONS.map((loc) => {
    const locRecords = activeRecords.filter((r) => r.locationId === loc.id)
    return {
      ...loc,
      total: locRecords.length,
      newCount: locRecords.filter((r) => r.status === "New").length,
      attentionCount: locRecords.filter((r) => r.status === "Needs Attention").length,
    }
  })

  // Records by category
  const byCategory = CATEGORY_ORDER.map((cat) => {
    const catRecords = activeRecords.filter((r) => r.category === cat)
    return { category: cat, count: catRecords.length }
  }).filter((c) => c.count > 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="New Uploads"
          value={newUploads}
          icon={Upload}
          iconClassName="bg-blue-50 text-blue-600"
          href="/records?status=New"
        />
        <StatCard
          label="Needs Attention"
          value={needsAttention}
          icon={AlertCircle}
          iconClassName="bg-amber-50 text-amber-600"
          href="/needs-review"
        />
        <StatCard
          label="Reviewed This Month"
          value={reviewedThisMonth}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 text-emerald-600"
          href="/records?status=Reviewed"
        />
        <StatCard
          label="Upcoming / Overdue"
          value={upcoming}
          icon={Clock}
          iconClassName="bg-red-50 text-red-600"
          href="/needs-review"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Uploads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Uploads</h2>
              <Link
                href="/records"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentUploads.map((rec) => {
                const location = LOCATIONS.find((l) => l.id === rec.locationId)
                return (
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
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {location?.name} &middot; {rec.uploadedBy} &middot;{" "}
                        {new Date(rec.uploadDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={rec.status} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Needs Review Queue */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Needs Review</h2>
              <Link
                href="/needs-review"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {needsReviewRecords.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                No records pending review.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {needsReviewRecords.map((rec) => {
                  const location = LOCATIONS.find((l) => l.id === rec.locationId)
                  const daysAgo =
                    now !== null
                      ? Math.floor((now - new Date(rec.uploadDate).getTime()) / 86400000)
                      : null
                  return (
                    <Link
                      key={rec.id}
                      href={`/records/${rec.id}`}
                      className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-50">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{rec.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {location?.name} &middot; {rec.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={rec.status} />
                        {daysAgo !== null && (
                          <span className="text-[10px] text-muted-foreground">{daysAgo}d ago</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              <Link
                href="/activity"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((evt) => (
                <div key={evt.id} className="px-5 py-3">
                  <p className="text-xs font-medium text-foreground leading-snug">{evt.detail}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {evt.user} &middot;{" "}
                    {new Date(evt.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Records by Location */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">By Location</h2>
            </div>
            <div className="divide-y divide-border">
              {byLocation.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/locations/${loc.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{loc.name}</p>
                    <p className="text-[11px] text-muted-foreground">{loc.total} records</p>
                  </div>
                  {loc.attentionCount > 0 && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      {loc.attentionCount} attention
                    </span>
                  )}
                  {loc.newCount > 0 && loc.attentionCount === 0 && (
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {loc.newCount} new
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Records by Category */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">By Category</h2>
            </div>
            <div className="px-5 py-3 space-y-2">
              {byCategory.map(({ category, count }) => (
                <Link
                  key={category}
                  href={`/records?category=${encodeURIComponent(category)}`}
                  className="flex items-center justify-between gap-2 hover:opacity-80"
                >
                  <CategoryBadge category={category} className="text-[11px]" />
                  <span className="text-xs font-medium text-muted-foreground">{count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Audit Placeholder */}
          {role === "owner" && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Coming Soon
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">Compliance Audits</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Random sample audits, checklists, and audit completion tracking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
