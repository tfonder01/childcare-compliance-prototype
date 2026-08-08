"use client"

import { Suspense, useState, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, FileText, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS } from "@/lib/mock-data"
import { StatusBadge } from "@/components/status-badge"
import { CategoryBadge } from "@/components/category-badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ComplianceCategory, RecordStatus } from "@/lib/types"

const CATEGORIES: ComplianceCategory[] = [
  "Licensing",
  "Health & Safety Drills",
  "Child Files",
  "Staff Files",
  "CCIR / Critical Incidents",
  "Parent Complaints",
  "Staff Complaints",
]

const STATUSES: RecordStatus[] = ["New", "Reviewed", "Needs Attention", "Archived"]

type SortField = "title" | "location" | "category" | "uploadDate" | "status" | "lastUpdated"
type SortDir = "asc" | "desc"

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
  return sortDir === "asc" ? (
    <ChevronUp className="h-3.5 w-3.5 text-foreground" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 text-foreground" />
  )
}

function RecordsContent() {
  const { records, role } = useApp()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") ?? "all")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all")
  const [sortField, setSortField] = useState<SortField>("uploadDate")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const filtered = useMemo(() => {
    let result = records
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.uploadedBy.toLowerCase().includes(q)
      )
    }
    if (locationFilter !== "all") result = result.filter((r) => r.locationId === locationFilter)
    if (categoryFilter !== "all") result = result.filter((r) => r.category === categoryFilter)
    if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter)

    return [...result].sort((a, b) => {
      let av = ""
      let bv = ""
      if (sortField === "title") { av = a.title; bv = b.title }
      else if (sortField === "location") {
        av = LOCATIONS.find((l) => l.id === a.locationId)?.name ?? ""
        bv = LOCATIONS.find((l) => l.id === b.locationId)?.name ?? ""
      }
      else if (sortField === "category") { av = a.category; bv = b.category }
      else if (sortField === "uploadDate") { av = a.uploadDate; bv = b.uploadDate }
      else if (sortField === "status") { av = a.status; bv = b.status }
      else if (sortField === "lastUpdated") { av = a.lastUpdated; bv = b.lastUpdated }
      const cmp = av.localeCompare(bv)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [records, search, locationFilter, categoryFilter, statusFilter, sortField, sortDir])

  const ThCell = ({
    field,
    children,
    className = "",
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
  }) => (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </div>
    </th>
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={locationFilter} onValueChange={(value) => setLocationFilter(value ?? "all")}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-[180px]">
            <SelectValue>
              {locationFilter === "all"
                ? "All Locations"
                : LOCATIONS.find((l) => l.id === locationFilter)?.name ?? "All Locations"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATIONS.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-[190px]">
            <SelectValue>
              {categoryFilter === "all" ? "All Categories" : categoryFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="h-9 w-full text-sm sm:w-[160px]">
            <SelectValue>
              {statusFilter === "all" ? "All Statuses" : statusFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <ThCell field="title">Record Title</ThCell>
                <ThCell field="location">Location</ThCell>
                <ThCell field="category" className="hidden lg:table-cell">Category</ThCell>
                <ThCell field="uploadDate" className="hidden md:table-cell">Uploaded</ThCell>
                <ThCell field="status">Status</ThCell>
                <ThCell field="lastUpdated" className="hidden xl:table-cell">Last Updated</ThCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const location = LOCATIONS.find((l) => l.id === rec.locationId)
                  return (
                    <tr
                      key={rec.id}
                      className="group cursor-pointer transition-colors duration-150 hover:bg-muted/50 focus-within:bg-muted/50"
                    >
                      <td className="px-4 py-3.5">
                        <Link href={`/records/${rec.id}`} className="flex items-center gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground leading-snug group-hover:text-primary truncate max-w-[260px]">
                              {rec.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{rec.uploadedBy}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/records/${rec.id}`}>
                          <p className="text-xs text-foreground">{location?.name ?? "—"}</p>
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3.5 lg:table-cell">
                        <Link href={`/records/${rec.id}`}>
                          <CategoryBadge category={rec.category} />
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-muted-foreground md:table-cell">
                        <Link href={`/records/${rec.id}`}>
                          {new Date(rec.uploadDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/records/${rec.id}`}>
                          <StatusBadge status={rec.status} />
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-muted-foreground xl:table-cell">
                        <Link href={`/records/${rec.id}`}>
                          {new Date(rec.lastUpdated).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function RecordsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4" aria-label="Loading records">
          <div className="h-9 w-full max-w-xl animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
          <div className="h-96 animate-pulse rounded-xl border border-border bg-card motion-reduce:animate-none" />
        </div>
      }
    >
      <RecordsContent />
    </Suspense>
  )
}
