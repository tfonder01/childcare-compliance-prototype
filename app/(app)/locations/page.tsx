"use client"

import Link from "next/link"
import { MapPin, Users, FileText, AlertCircle, ArrowRight } from "lucide-react"
import { useApp } from "@/lib/store"

export default function LocationsPage() {
  const { records, locations } = useApp()

  const locationsWithStats = locations.map((loc) => {
    const locRecords = records.filter((r) => r.locationId === loc.id && r.status !== "Archived")
    const newCount = locRecords.filter((r) => r.status === "New").length
    const attentionCount = locRecords.filter((r) => r.status === "Needs Attention").length
    const reviewedCount = locRecords.filter((r) => r.status === "Reviewed").length

    const lastUpload = locRecords.reduce((latest, r) => {
      return r.uploadDate > latest ? r.uploadDate : latest
    }, "")

    return { ...loc, total: locRecords.length, newCount, attentionCount, reviewedCount, lastUpload }
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {locationsWithStats.map((loc) => (
          <Link
            key={loc.id}
            href={`/locations/${loc.id}`}
            className="interactive-card group rounded-xl border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground opacity-50 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-100" />
            </div>

            <div className="mt-3">
              <h2 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">{loc.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {loc.director}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{loc.address}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-center">
                <p className="text-lg font-bold text-foreground">{loc.total}</p>
                <p className="text-[10px] text-muted-foreground">Records</p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-center">
                <p className="text-lg font-bold text-amber-700">{loc.attentionCount}</p>
                <p className="text-[10px] text-amber-600">Attention</p>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-center">
                <p className="text-lg font-bold text-blue-700">{loc.newCount}</p>
                <p className="text-[10px] text-blue-600">New</p>
              </div>
            </div>

            {loc.attentionCount > 0 && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {loc.attentionCount} record{loc.attentionCount !== 1 ? "s" : ""} need{loc.attentionCount === 1 ? "s" : ""} attention
              </div>
            )}

            {loc.lastUpload && (
              <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                Last upload:{" "}
                {new Date(loc.lastUpload).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
