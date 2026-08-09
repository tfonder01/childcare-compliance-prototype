"use client"

import { ArrowRight, ClipboardList, PackageSearch, Wrench } from "lucide-react"
import { CLASSROOM_AGE_GROUPS, FUTURE_MAINTENANCE_INSIGHT } from "@/lib/mock-data"
import { useApp } from "@/lib/store"

type WorkflowKind = "maintenance" | "supply"

const CONTENT = {
  maintenance: {
    eyebrow: "Next implementation phase",
    title: "Maintenance requests, organized by location and classroom",
    description: "A focused request workflow will connect reported issues, photos, vendors, invoices, and approvals without mixing them into compliance records.",
    icon: Wrench,
    steps: ["Report an issue", "Review and assign", "Track repair and cost"],
  },
  supply: {
    eyebrow: "Next implementation phase",
    title: "Supply requests with a clear approval trail",
    description: "Teams will be able to submit itemized requests for their assigned location, add context, and follow approval status from one place.",
    icon: PackageSearch,
    steps: ["Build a request", "Submit for review", "Track approval status"],
  },
} as const

export function FutureWorkflowPage({ kind }: { kind: WorkflowKind }) {
  const { currentUser, locations, role } = useApp()
  const content = CONTENT[kind]
  const Icon = content.icon

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-violet-100/55 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{content.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{content.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{content.description}</p>
        </div>

        <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
          {content.steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-xl border border-border bg-background/85 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span>
              <span className="text-sm font-medium text-foreground">{step}</span>
              {index < content.steps.length - 1 && <ArrowRight className="ml-auto hidden h-4 w-4 text-muted-foreground sm:block" />}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Prepared prototype context</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {role === "owner"
              ? `Owner view will cover all ${locations.length} locations and future approval decisions.`
              : `${currentUser.name} will submit and track requests only for ${locations[0]?.name}.`}
          </p>

          {kind === "maintenance" ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Classroom / age group</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CLASSROOM_AGE_GROUPS.map((group) => (
                    <span key={group} className="rounded-full border border-border bg-muted/45 px-3 py-1 text-xs font-medium text-foreground">{group}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4">
                <p className="text-xs font-semibold text-orange-800">Future repeat-issue signal</p>
                <p className="mt-1 text-sm font-medium text-foreground">{FUTURE_MAINTENANCE_INSIGHT.assetName} · {FUTURE_MAINTENANCE_INSIGHT.area}</p>
                <p className="mt-1 text-xs text-muted-foreground">{FUTURE_MAINTENANCE_INSIGHT.invoices.length} repair invoice · ${FUTURE_MAINTENANCE_INSIGHT.repeatRecordedCost?.toLocaleString()} total · {FUTURE_MAINTENANCE_INSIGHT.vendor}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Itemized quantities", "Location assignment", "Director notes", "Owner approval status"].map((item) => (
                <div key={item} className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-foreground">{item}</div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-dashed border-violet-200 bg-violet-50/35 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Phase boundary</p>
          <p className="mt-2 text-sm font-medium text-foreground">Concept preview only</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Submitting, approving, vendor management, purchasing, and invoice processing will be added in a separate implementation phase.</p>
        </aside>
      </div>
    </div>
  )
}
