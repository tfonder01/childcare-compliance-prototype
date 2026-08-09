"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquareMore,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Upload,
  User,
  Wrench,
  XCircle,
} from "lucide-react"
import { useApp } from "@/lib/store"
import { MAINTENANCE_VENDORS } from "@/lib/mock-data"
import type { Comment, MaintenanceStatus } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApprovalStatusBadge, MaintenanceStatusBadge, PriorityBadge, RepeatIssueBadge } from "@/components/maintenance-badges"
import { cn } from "@/lib/utils"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const fieldClass = "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
const timelineIcons: Record<string, React.ElementType> = {
  created: Wrench,
  edited: Building2,
  status_changed: CheckCircle2,
  comment_added: MessageSquareMore,
  file_uploaded: Upload,
  archived: Archive,
  restored: RotateCcw,
}

function Meta({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return <div><dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</dt><dd className="mt-1 text-sm text-foreground">{children}</dd></div>
}

export default function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const {
    maintenanceRequests,
    locations,
    comments,
    activity,
    currentUser,
    role,
    updateMaintenanceRequest,
    archiveMaintenanceRequest,
    restoreMaintenanceRequest,
    addMaintenanceFile,
    addComment,
    showToast,
  } = useApp()
  const router = useRouter()
  const request = maintenanceRequests.find((item) => item.id === id)
  const [commentText, setCommentText] = useState("")
  const [vendor, setVendor] = useState(request?.vendor ?? "")
  const [assignedTo, setAssignedTo] = useState(request?.assignedTo ?? "")
  const [vendorContact, setVendorContact] = useState(request?.vendorContact ?? "")
  const [scheduledDate, setScheduledDate] = useState(request?.scheduledDate ?? "")
  const [estimatedCost, setEstimatedCost] = useState(request?.estimatedCost?.toString() ?? "")
  const [finalCost, setFinalCost] = useState(request?.finalCost?.toString() ?? "")

  if (!request) {
    return <div className="flex flex-col items-center gap-4 py-16"><p className="text-sm text-muted-foreground">Maintenance request not found or unavailable for this role.</p><Button render={<Link href="/maintenance" />} nativeButton={false} variant="outline">Back to Maintenance</Button></div>
  }

  const location = locations.find((item) => item.id === request.locationId)
  const requestComments = comments.filter((comment) => comment.recordId === id).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const requestActivity = activity.filter((event) => event.recordId === id).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const canEdit = !request.archived && request.approvalStatus !== "Declined"
  const progressSteps = ["Submitted", "Approved / Ready", "In Progress", "Completed"] as const
  const progressStopped = request.approvalStatus === "Declined" || request.maintenanceStatus === "Cancelled"
  const progressIndex = request.approvalStatus === "Awaiting Approval" || request.approvalStatus === "Declined"
    ? 0
    : request.maintenanceStatus === "Completed"
      ? 3
      : request.maintenanceStatus === "In Progress" || request.maintenanceStatus === "Waiting"
        ? 2
        : request.maintenanceStatus === "Approved / Ready"
          ? 1
          : request.maintenanceStatus === "Cancelled" && request.approvalStatus === "Approved"
            ? 1
            : 0

  const updateStatus = (status: MaintenanceStatus) => {
    updateMaintenanceRequest(id, {
      maintenanceStatus: status,
      completedAt: status === "Completed" ? new Date().toISOString() : request.completedAt,
    }, `Maintenance status changed to ${status}.`)
  }

  const addRequestComment = () => {
    if (!commentText.trim()) return
    const comment: Comment = {
      id: `mcmt_${Date.now()}`,
      recordId: id,
      user: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
      isUnread: false,
    }
    addComment(comment)
    setCommentText("")
  }

  const saveRepairDetails = () => {
    updateMaintenanceRequest(id, {
      vendor: vendor || undefined,
      assignedTo: assignedTo || undefined,
      vendorContact: vendorContact || undefined,
      scheduledDate: scheduledDate || undefined,
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
      finalCost: finalCost ? Number(finalCost) : undefined,
    }, "Vendor, assignment, and cost details updated.")
  }

  const fileHandler = (field: "originalPhotos" | "completionPhotos" | "invoices") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) addMaintenanceFile(id, field, file.name)
    event.target.value = ""
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link href="/maintenance" className="inline-flex items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" />Back to Maintenance</Link>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Maintenance request</span>{request.repeatRepairCount && request.repeatRepairCount > 1 ? <RepeatIssueBadge /> : null}</div>
              <h1 className="mt-2 text-xl font-semibold leading-tight text-foreground sm:text-2xl">{request.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Request {request.id} · Last updated {new Date(request.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
            <div className="flex flex-wrap gap-2"><PriorityBadge priority={request.priority} /><ApprovalStatusBadge status={request.approvalStatus} /><MaintenanceStatusBadge status={request.maintenanceStatus} /></div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/15 px-4 py-4 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Maintenance progress</p>
            <div className="flex flex-wrap gap-1.5">
              {request.approvalStatus === "Awaiting Approval" && <ApprovalStatusBadge status="Awaiting Approval" />}
              {request.approvalStatus === "Declined" && <ApprovalStatusBadge status="Declined" />}
              {request.maintenanceStatus === "Waiting" && <MaintenanceStatusBadge status="Waiting" />}
              {request.maintenanceStatus === "Cancelled" && <MaintenanceStatusBadge status="Cancelled" />}
            </div>
          </div>
          <ol className="grid grid-cols-4" aria-label={`Maintenance progress: ${request.maintenanceStatus}`}>
            {progressSteps.map((step, index) => {
              const completed = index < progressIndex
              const current = index === progressIndex
              const finished = request.maintenanceStatus === "Completed" && index === progressSteps.length - 1
              return (
                <li key={step} className="relative flex min-w-0 flex-col items-center text-center" aria-current={current ? "step" : undefined}>
                  {index < progressSteps.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-[calc(50%+0.875rem)] top-[13px] h-0.5 w-[calc(100%-1.75rem)] transition-colors duration-200 motion-reduce:duration-0",
                        index < progressIndex ? (progressStopped ? "bg-slate-300" : "bg-emerald-500") : "bg-slate-200"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-[background-color,border-color,color] duration-200 motion-reduce:duration-0",
                      completed && !progressStopped && "border-emerald-600 bg-emerald-600 text-white",
                      completed && progressStopped && "border-slate-300 bg-slate-100 text-slate-600",
                      current && !progressStopped && !finished && "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100",
                      current && finished && "border-emerald-600 bg-emerald-600 text-white ring-4 ring-emerald-100",
                      current && progressStopped && "border-rose-300 bg-rose-50 text-rose-700 ring-4 ring-rose-100/70",
                      !completed && !current && "border-slate-200 bg-card text-slate-400"
                    )}
                  >
                    {completed || finished ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={cn("mt-2 max-w-24 text-[10px] font-medium leading-tight sm:text-xs", current ? "text-foreground" : completed ? "text-slate-700" : "text-muted-foreground")}>{step}</span>
                  <span className="sr-only">{completed ? "Completed" : current ? "Current step" : "Not started"}</span>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {request.repeatRepairCount && request.repeatRepairCount > 1 && (
        <section className="rounded-xl border border-orange-200 bg-orange-50/45 p-4 shadow-sm">
          <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700"><AlertTriangle className="h-4.5 w-4.5" /></div><div><p className="text-sm font-semibold text-foreground">Repeat issue: {request.assetName}</p><p className="mt-1 text-sm text-muted-foreground">{request.repeatRepairCount} repairs in the last 12 months · Total recorded cost: <span className="font-semibold text-foreground">{money.format(request.repeatRecordedCost ?? 0)}</span></p><p className="mt-1 text-xs text-muted-foreground">Tracked with repeat key <span className="font-mono">{request.repeatIssueKey}</span> for future maintenance analytics.</p></div></div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Request details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3">
              <Meta icon={MapPin} label="Location">{location?.name ?? "—"}</Meta>
              <Meta icon={Building2} label="Classroom / Area">{request.area}</Meta>
              <Meta icon={Wrench} label="Category">{request.category}</Meta>
              <Meta icon={User} label="Submitted by">{request.submittedBy}</Meta>
              <Meta icon={CalendarDays} label="Submitted">{new Date(request.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</Meta>
              <Meta icon={ShieldCheck} label="Approval"><ApprovalStatusBadge status={request.approvalStatus} /></Meta>
            </dl>
            <div className="mt-5 rounded-lg bg-muted/40 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description</p><p className="mt-1.5 text-sm leading-relaxed text-foreground">{request.description}</p></div>
            {request.approvalNote && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/55 p-3"><p className="text-xs font-semibold text-amber-800">Approval note</p><p className="mt-1 text-sm text-foreground">{request.approvalNote}</p></div>}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-foreground">Photos and invoices</h2><p className="mt-0.5 text-xs text-muted-foreground">Prototype attachments preserve filenames and upload history.</p></div></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Original photos", field: "originalPhotos" as const, items: request.originalPhotos, icon: Camera, accept: "image/*" },
                { title: "Completion photos", field: "completionPhotos" as const, items: request.completionPhotos, icon: ImageIcon, accept: "image/*" },
                { title: "Invoices", field: "invoices" as const, items: request.invoices, icon: FileText, accept: ".pdf,image/*" },
              ].map(({ title, field, items, icon: Icon, accept }) => (
                <div key={field} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><p className="text-xs font-semibold text-foreground">{title}</p><span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{items.length}</span></div>
                  <div className="mt-3 space-y-2">{items.map((item) => <button key={`${item.name}-${item.uploadedAt}`} type="button" onClick={() => showToast(`Attachment ready: ${item.name}`)} className="block w-full truncate rounded-md border border-border bg-card px-2.5 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/25 hover:bg-muted/40">{item.name}</button>)}{items.length === 0 && <p className="py-2 text-center text-[11px] text-muted-foreground">None attached</p>}</div>
                  {canEdit && <label className="mt-3 flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5"><Upload className="h-3.5 w-3.5" />Upload<input type="file" className="sr-only" accept={accept} onChange={fileHandler(field)} /></label>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Comments and notes <span className="font-normal text-muted-foreground">({requestComments.length})</span></h2>
            <div className="mt-4 space-y-4">{requestComments.map((comment) => <div key={comment.id} className="flex gap-3"><div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", comment.role === "owner" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700")}>{comment.user.split(" ").map((part) => part[0]).join("")}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-2"><span className="text-sm font-medium text-foreground">{comment.user}</span><span className="text-[10px] capitalize text-muted-foreground">{comment.role.replace("_", " ")}</span><span className="ml-auto text-[10px] text-muted-foreground">{new Date(comment.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span></div><p className="mt-1 rounded-lg bg-muted/40 px-3.5 py-3 text-sm leading-relaxed text-foreground">{comment.text}</p></div></div>)}{requestComments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}</div>
            {canEdit && <div className="mt-4 flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{currentUser.initials}</div><div className="flex-1"><Textarea rows={3} value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Add a progress update, question, or note…" /><Button size="sm" className="mt-2 gap-1.5" onClick={addRequestComment} disabled={!commentText.trim()}><Send className="h-3.5 w-3.5" />Add comment</Button></div></div>}
          </section>
        </div>

        <aside className="space-y-5">
          {role === "owner" && !request.archived && (
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">Owner approval</h2>
              <p className="mt-1 text-xs text-muted-foreground">Approval is separate from repair progress.</p>
              <div className="mt-3 space-y-2">
                <Button className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-600/90" size="sm" onClick={() => updateMaintenanceRequest(id, { approvalStatus: "Approved", maintenanceStatus: request.maintenanceStatus === "Submitted" ? "Approved / Ready" : request.maintenanceStatus, needsMoreInfo: false, approvalNote: "Approved by Owner." }, "Owner approved the maintenance request.")} disabled={request.approvalStatus === "Approved"}><CheckCircle2 className="h-4 w-4" />Approve</Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-amber-700" size="sm" onClick={() => updateMaintenanceRequest(id, { needsMoreInfo: true, approvalNote: "Owner requested more information before approval." }, "Owner requested more information.")}><MessageSquareMore className="h-4 w-4" />Request more information</Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-rose-700" size="sm" onClick={() => updateMaintenanceRequest(id, { approvalStatus: "Declined", maintenanceStatus: "Cancelled", approvalNote: "Declined by Owner." }, "Owner declined the maintenance request.")} disabled={request.approvalStatus === "Declined"}><XCircle className="h-4 w-4" />Decline</Button>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Repair progress</h2>
            <div className="mt-3 grid gap-2">
              <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => updateStatus("In Progress")} disabled={!canEdit || request.maintenanceStatus === "In Progress"}><PlayCircle className="h-4 w-4 text-indigo-600" />Mark In Progress</Button>
              <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => updateStatus("Waiting")} disabled={!canEdit || request.maintenanceStatus === "Waiting"}><PauseCircle className="h-4 w-4 text-amber-600" />Mark Waiting</Button>
              <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => updateStatus("Completed")} disabled={!canEdit || request.maintenanceStatus === "Completed"}><CheckCircle2 className="h-4 w-4 text-emerald-600" />Mark Complete</Button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Vendor, assignment and cost</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5"><Label htmlFor="assigned-to">Assigned To</Label><Input id="assigned-to" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} placeholder="Person or team" disabled={!canEdit} /></div>
              <div className="space-y-1.5"><Label htmlFor="vendor">Vendor</Label><select id="vendor" className={fieldClass} value={vendor} onChange={(event) => setVendor(event.target.value)} disabled={!canEdit}><option value="">Not assigned</option>{MAINTENANCE_VENDORS.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="space-y-1.5"><Label htmlFor="vendor-contact">Vendor Contact <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="vendor-contact" value={vendorContact} onChange={(event) => setVendorContact(event.target.value)} placeholder="Phone or email" disabled={!canEdit} /></div>
              <div className="space-y-1.5"><Label htmlFor="scheduled-date">Scheduled Date</Label><Input id="scheduled-date" type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} disabled={!canEdit} /></div>
              <div className="grid grid-cols-2 gap-2"><div className="space-y-1.5"><Label htmlFor="estimated-cost">Estimated</Label><Input id="estimated-cost" type="number" min="0" step="0.01" value={estimatedCost} onChange={(event) => setEstimatedCost(event.target.value)} disabled={!canEdit} /></div><div className="space-y-1.5"><Label htmlFor="final-cost">Final</Label><Input id="final-cost" type="number" min="0" step="0.01" value={finalCost} onChange={(event) => setFinalCost(event.target.value)} disabled={!canEdit} /></div></div>
              {canEdit && <Button size="sm" className="w-full" onClick={saveRepairDetails}>Save repair details</Button>}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4"><div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Estimated</p><p className="mt-1 text-sm font-semibold tabular-nums">{request.estimatedCost != null ? money.format(request.estimatedCost) : "—"}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Final</p><p className="mt-1 text-sm font-semibold tabular-nums">{request.finalCost != null ? money.format(request.finalCost) : "—"}</p></div></div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Activity timeline</h2>
            <div className="mt-4 space-y-4">{requestActivity.map((event, index) => { const Icon = timelineIcons[event.type] ?? Clock3; return <div key={event.id} className="relative flex gap-3">{index < requestActivity.length - 1 && <span className="absolute left-3.5 top-7 h-full w-px bg-border" />}<span className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card"><Icon className="h-3 w-3 text-muted-foreground" /></span><div className="pb-1"><p className="text-xs font-medium leading-snug text-foreground">{event.detail}</p><p className="mt-1 text-[10px] text-muted-foreground">{event.user} · {new Date(event.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p></div></div>})}</div>
          </section>

          {role === "owner" && (
            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
              {request.archived ? <Button variant="outline" className="w-full justify-start gap-2" onClick={() => restoreMaintenanceRequest(id)}><RotateCcw className="h-4 w-4" />Restore request</Button> : <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => { archiveMaintenanceRequest(id); router.push("/archived") }}><Archive className="h-4 w-4" />Archive request</Button>}
              <p className="mt-2 text-[11px] text-muted-foreground">No permanent delete. Repair history remains intact.</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
