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
  ClipboardCheck,
  Wrench,
} from "lucide-react"
import { useApp } from "@/lib/store"
import { COMPLIANCE_CATEGORIES } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import { useState, useEffect } from "react"
import { isOperationsRecord } from "@/lib/record-workspaces"

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
      className="interactive-card group flex min-h-32 flex-col gap-3 rounded-xl border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-current/10 ${iconClassName}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-auto text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
    </Link>
  )
}

export default function DashboardPage() {
  const { records, activity, role, locations, maintenanceRequests } = useApp()
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { setNow(Date.now()) }, [])

  const activeRecords = records.filter((r) => r.status !== "Archived")
  const operationsRecords = activeRecords.filter(isOperationsRecord)
  const activeMaintenance = maintenanceRequests.filter((request) => !request.archived)
  const maintenanceAttention = activeMaintenance.filter((request) =>
    request.approvalStatus === "Awaiting Approval" || request.needsMoreInfo || ["Submitted", "Waiting"].includes(request.maintenanceStatus)
  )
  const maintenanceAwaitingApproval = activeMaintenance.filter((request) => request.approvalStatus === "Awaiting Approval")
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
  const byLocation = locations.map((loc) => {
    const locRecords = activeRecords.filter((r) => r.locationId === loc.id)
    return {
      ...loc,
      total: locRecords.length,
      newCount: locRecords.filter((r) => r.status === "New").length,
      attentionCount: locRecords.filter((r) => r.status === "Needs Attention").length,
    }
  })

  // Records by category
  const byCategory = COMPLIANCE_CATEGORIES.map((cat) => {
    const catRecords = activeRecords.filter((r) => r.category === cat)
    return { category: cat, count: catRecords.length }
  }).filter((c) => c.count > 0)

  const auditMetrics = role === "owner"
    ? [
        { label: "Child Files", active: 124, required: 13, reviewed: 8, remaining: 5 },
        { label: "Staff Files", active: 38, required: 4, reviewed: 3, remaining: 1 },
      ]
    : [
        { label: "Child Files", active: 46, required: 5, reviewed: 3, remaining: 2 },
        { label: "Staff Files", active: 14, required: 2, reviewed: 1, remaining: 1 },
      ]

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

      <section className="overflow-hidden rounded-xl border border-violet-200/70 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border bg-violet-50/45 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <ClipboardCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Monthly File Audits</h2>
              <p className="text-xs text-muted-foreground">Prototype concept · 10% monthly sample target</p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-medium text-violet-700">Future workflow preview</span>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2">
          {auditMetrics.map((metric) => {
            const progress = Math.round((metric.reviewed / metric.required) * 100)
            return (
              <div key={metric.label} className="bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{metric.label}</p>
                  <span className="text-xs font-medium text-emerald-700">{metric.reviewed} of {metric.required} reviewed</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-label={`${metric.label} audit progress: ${progress}%`}>
                  <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Active", metric.active],
                    ["Target", "10%"],
                    ["Required", metric.required],
                    ["Remaining", metric.remaining],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-muted/45 px-2 py-2">
                      <p className="text-sm font-bold text-foreground">{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Uploads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Uploads</h2>
              <Link
                href="/records"
                className="arrow-link flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentUploads.map((rec) => {
                const location = locations.find((l) => l.id === rec.locationId)
                return (
                  <Link
                    key={rec.id}
                    href={`/records/${rec.id}`}
                    className="interactive-row flex items-start gap-3 px-5 py-3.5"
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
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Needs Review</h2>
              <Link
                href="/needs-review"
                className="arrow-link flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  const location = locations.find((l) => l.id === rec.locationId)
                  const daysAgo =
                    now !== null
                      ? Math.floor((now - new Date(rec.uploadDate).getTime()) / 86400000)
                      : null
                  return (
                    <Link
                      key={rec.id}
                      href={`/records/${rec.id}`}
                      className="interactive-row flex items-start gap-3 px-5 py-3.5"
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
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
              <Link
                href="/activity"
                className="arrow-link flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((evt) => (
                <div key={evt.id} className="px-5 py-3 transition-colors duration-150 hover:bg-muted/30">
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
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">By Location</h2>
            </div>
            <div className="divide-y divide-border">
              {byLocation.map((loc) => (
                <Link
                  key={loc.id}
                  href={`/locations/${loc.id}`}
                  className="interactive-row flex items-center gap-3 px-5 py-3"
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
                  className="interactive-row -mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1"
                >
                  <CategoryBadge category={category} className="text-[11px]" />
                  <span className="text-xs font-medium text-muted-foreground">{count}</span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/operations"
            className="interactive-card block rounded-xl border border-blue-200/70 bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Operations Records</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{operationsRecords.length}</p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>{operationsRecords.filter((record) => record.status === "New").length} new</p>
                <p>{operationsRecords.filter((record) => record.status === "Needs Attention").length} need attention</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Recurring checklists and operational documentation</p>
          </Link>

          <Link href="/maintenance" className="interactive-card block rounded-xl border border-orange-200/70 bg-card p-5">
              <div className="flex items-center gap-2 text-orange-700">
                <Wrench className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">Maintenance</p>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div><p className="text-2xl font-bold text-foreground">{maintenanceAttention.length}</p><p className="text-xs text-muted-foreground">need attention</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-amber-700">{maintenanceAwaitingApproval.length}</p><p className="text-[11px] text-muted-foreground">awaiting approval</p></div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Open requests, approvals, and recent repair activity</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
