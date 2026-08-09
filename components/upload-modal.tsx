"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, File, Upload } from "lucide-react"
import { useApp } from "@/lib/store"
import { CLASSROOM_AGE_GROUPS, COMPLIANCE_CATEGORIES, OPERATIONS_RECORD_TYPES } from "@/lib/mock-data"
import type {
  ClassroomAgeGroup,
  ComplianceCategory,
  OperationsRecordType,
  RecordCategory,
  RecordWorkspace,
} from "@/lib/types"

const TODAY = new Date().toISOString().split("T")[0]
const CURRENT_YEAR = Number(TODAY.slice(0, 4))

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const

const YEARS = Array.from({ length: 8 }, (_, index) => String(CURRENT_YEAR - 2 + index))

const RECORD_TYPE_OPTIONS: Partial<Record<ComplianceCategory, readonly string[]>> = {
  "Health & Safety Drills": ["Fire Drill", "Lockdown Drill", "Tornado Drill", "Other Drill"],
  Licensing: ["State Licensing Inspection", "Annual DCF Licensing Renewal", "Other Licensing Record"],
  "Child Files": ["Child Enrollment File", "Child File Audit", "Other Child Record"],
  "Staff Files": ["Staff Background Check", "CPR / First Aid Certification", "Staff File Audit", "Other Staff Record"],
  "Parent Complaints": ["Parent Complaint", "Supervision Concern", "Health / Safety Concern", "Other Parent Complaint"],
  "Staff Complaints": ["Workplace Conduct", "Scheduling / Policy", "Other Staff Complaint"],
}

interface UploadModalProps {
  open: boolean
  onClose: () => void
  defaultLocationId?: string
  defaultWorkspace?: RecordWorkspace
}

function createInitialForm(locationId: string, workspace: RecordWorkspace | "") {
  return {
    locationId,
    workspace,
    category: (workspace === "operations" ? "Operations" : "") as RecordCategory | "",
    classroomAgeGroup: "" as ClassroomAgeGroup | "",
    area: "",
    recordType: "",
    month: TODAY.slice(5, 7),
    year: TODAY.slice(0, 4),
    date: TODAY,
    referenceText: "",
    incidentText: "",
    useCustomTitle: false,
    customTitle: "",
    description: "",
    fileName: "",
  }
}

type UploadForm = ReturnType<typeof createInitialForm>

function monthLabel(month: string) {
  return MONTHS.find((option) => option.value === month)?.label ?? ""
}

function generateRecordTitle(form: UploadForm) {
  const monthYear = form.month && form.year ? `${monthLabel(form.month)} ${form.year}` : ""
  const reference = form.referenceText.trim()
  const incident = form.incidentText.trim()

  switch (form.category) {
    case "Classroom Observations":
      return form.classroomAgeGroup && monthYear
        ? `${form.classroomAgeGroup} Classroom Observation — ${monthYear}`
        : ""
    case "Health & Safety Drills":
      return form.recordType && monthYear ? `${form.recordType} — ${monthYear}` : ""
    case "Operations":
      if (form.recordType === "Other Operations Record") {
        return reference ? `Operations — ${reference}` : ""
      }
      return form.recordType && monthYear ? `${form.recordType} — ${monthYear}` : ""
    case "Licensing":
      return form.recordType && form.year ? `${form.recordType} — ${form.year}` : ""
    case "Child Files":
    case "Staff Files":
      return form.recordType && reference ? `${form.recordType} — ${reference}` : ""
    case "Parent Complaints": {
      if (!form.recordType || (!form.classroomAgeGroup && !reference)) return ""
      const parts = [form.recordType]
      if (form.classroomAgeGroup) parts.push(`${form.classroomAgeGroup} Classroom`)
      if (reference) parts.push(reference)
      return parts.join(" — ")
    }
    case "Staff Complaints":
      return form.recordType
        ? ["Staff Complaint", form.recordType, reference].filter(Boolean).join(" — ")
        : ""
    case "CCIR / Critical Incidents":
      return incident ? `CCIR / Critical Incident — ${incident}` : ""
    default:
      return ""
  }
}

function relatedReference(form: UploadForm) {
  const reference = form.referenceText.trim()
  const incident = form.incidentText.trim()

  if (form.category === "Child Files" && reference) return `Child: ${reference}`
  if (form.category === "Staff Files" && reference) return `Staff: ${reference}`
  if ((form.category === "Parent Complaints" || form.category === "Staff Complaints") && reference) {
    return `Reference: ${reference}`
  }
  if (form.category === "CCIR / Critical Incidents" && incident) return `Incident: ${incident}`
  return undefined
}

export function UploadModal({ open, onClose, defaultLocationId, defaultWorkspace }: UploadModalProps) {
  const { addRecord, currentUser, role, locations } = useApp()
  const initialLocationId = defaultLocationId ?? (role !== "owner" ? currentUser.locationId ?? "" : "")
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(() => createInitialForm(initialLocationId, defaultWorkspace ?? ""))

  const generatedTitle = generateRecordTitle(form)
  const recordTitle = form.useCustomTitle ? form.customTitle.trim() : generatedTitle
  const canSubmit = Boolean(recordTitle && form.locationId && form.workspace && form.category)
  const recordTypeOptions =
    form.workspace === "operations"
      ? OPERATIONS_RECORD_TYPES
      : form.category && form.category !== "Operations"
        ? RECORD_TYPE_OPTIONS[form.category]
        : undefined
  const usesMonthYear =
    form.category === "Classroom Observations" ||
    form.category === "Health & Safety Drills" ||
    (form.category === "Operations" && form.recordType !== "Other Operations Record")
  const usesYear = usesMonthYear || form.category === "Licensing"
  const usesClassroom =
    form.workspace === "operations" ||
    form.category === "Classroom Observations" ||
    form.category === "Parent Complaints"
  const usesReference =
    form.category === "Child Files" ||
    form.category === "Staff Files" ||
    form.category === "Parent Complaints" ||
    form.category === "Staff Complaints" ||
    (form.category === "Operations" && form.recordType === "Other Operations Record")

  const handleCategoryChange = (value: string | null) => {
    setForm((current) => ({
      ...current,
      category: (value ?? "") as RecordCategory | "",
      classroomAgeGroup: "",
      recordType: "",
      referenceText: "",
      incidentText: "",
      useCustomTitle: false,
      customTitle: "",
    }))
  }

  const handleWorkspaceChange = (value: string | null) => {
    const workspace = (value ?? "") as RecordWorkspace | ""
    setForm((current) => ({
      ...current,
      workspace,
      category: workspace === "operations" ? "Operations" : "",
      classroomAgeGroup: "",
      area: "",
      recordType: "",
      referenceText: "",
      incidentText: "",
      useCustomTitle: false,
      customTitle: "",
    }))
  }

  const handleDateChange = (date: string) => {
    setForm((current) => ({
      ...current,
      date,
      ...(date ? { month: date.slice(5, 7), year: date.slice(0, 4) } : {}),
    }))
  }

  const handleSubmit = () => {
    if (!canSubmit || !form.category) return
    const now = new Date().toISOString().split("T")[0]
    addRecord({
      id: `rec_${Date.now()}`,
      title: recordTitle,
      locationId: form.locationId,
      category: form.category,
      workspace: form.workspace as RecordWorkspace,
      recordType:
        form.workspace === "operations" && form.recordType
          ? (form.recordType as OperationsRecordType)
          : undefined,
      status: "New",
      uploadedBy: currentUser.name,
      uploadedById: currentUser.id,
      uploadDate: form.date || now,
      lastUpdated: now,
      description: form.description,
      fileNames: form.fileName ? [form.fileName] : ["Document.pdf"],
      tags: [],
      relatedRef: relatedReference(form),
      classroomAgeGroup: form.classroomAgeGroup || undefined,
      area: form.area.trim() || undefined,
      observationMonth:
        form.category === "Classroom Observations" && form.month && form.year
          ? `${form.year}-${form.month}`
          : undefined,
    })
    setSubmitted(true)
  }

  const handleClose = () => {
    setSubmitted(false)
    setForm(createInitialForm(initialLocationId, defaultWorkspace ?? ""))
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center [animation:page-enter_200ms_ease-out_both]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Record uploaded successfully</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The record has been added with status{" "}
                <span className="font-medium text-blue-600">New</span> and ownership has been notified.
              </p>
            </div>
            <Button onClick={handleClose} className="mt-2">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {form.workspace === "operations" ? "Upload Operations Record" : "Upload Record"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              <div className="grid gap-1.5">
                <Label>Record Area *</Label>
                <Select value={form.workspace} onValueChange={handleWorkspaceChange}>
                  <SelectTrigger><SelectValue placeholder="Select record area" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.workspace === "compliance" && (
              <div className="grid gap-1.5">
                <Label>Location *</Label>
                <Select value={form.locationId} onValueChange={(value) => setForm((current) => ({ ...current, locationId: value ?? "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              )}

              <div className="grid gap-1.5">
                <Label>Compliance Category *</Label>
                <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {COMPLIANCE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.category && (
                <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 [animation:page-enter_180ms_ease-out_both]">
                  {recordTypeOptions && (
                    <div className="grid gap-1.5">
                      <Label>Record Type *</Label>
                      <Select value={form.recordType} onValueChange={(value) => setForm((current) => ({ ...current, recordType: value ?? "" }))}>
                        <SelectTrigger><SelectValue placeholder="Select record type" /></SelectTrigger>
                        <SelectContent>
                          {recordTypeOptions.map((recordType) => (
                            <SelectItem key={recordType} value={recordType}>{recordType}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {usesClassroom && (
                    <div className="grid gap-1.5">
                      <Label>Classroom / Age Group {form.category === "Classroom Observations" ? "*" : "(optional)"}</Label>
                      <Select
                        value={form.classroomAgeGroup}
                        onValueChange={(value) => setForm((current) => ({ ...current, classroomAgeGroup: (value ?? "") as ClassroomAgeGroup | "" }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Select classroom" /></SelectTrigger>
                        <SelectContent>
                          {CLASSROOM_AGE_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {form.workspace === "operations" && (
                    <div className="grid gap-1.5">
                      <Label>Area (optional)</Label>
                      <Input
                        placeholder="e.g. North Playground or Kitchen"
                        value={form.area}
                        onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))}
                      />
                    </div>
                  )}

                  {usesMonthYear && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <Label>Month *</Label>
                        <Select value={form.month} onValueChange={(value) => setForm((current) => ({ ...current, month: value ?? "" }))}>
                          <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((month) => (
                              <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Year *</Label>
                        <Select value={form.year} onValueChange={(value) => setForm((current) => ({ ...current, year: value ?? "" }))}>
                          <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                          <SelectContent>
                            {YEARS.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {usesYear && !usesMonthYear && (
                    <div className="grid gap-1.5">
                      <Label>Year *</Label>
                      <Select value={form.year} onValueChange={(value) => setForm((current) => ({ ...current, year: value ?? "" }))}>
                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                        <SelectContent>
                          {YEARS.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {usesReference && (
                    <div className="grid gap-1.5">
                      <Label>
                        {form.category === "Child Files"
                          ? "Child Name *"
                          : form.category === "Staff Files"
                            ? "Staff Name *"
                            : form.category === "Operations"
                              ? "Short Descriptor *"
                              : form.category === "Staff Complaints"
                                ? "Complaint Reference (optional)"
                                : "Incident / Reference *"}
                      </Label>
                      <Input
                        placeholder={
                          form.category === "Child Files"
                            ? "e.g. Sofia Rivera"
                            : form.category === "Staff Files"
                              ? "e.g. Maria Gonzalez"
                              : form.category === "Operations"
                                ? "e.g. Kitchen Inventory Review"
                                : "Short identifying reference"
                        }
                        value={form.referenceText}
                        onChange={(event) => setForm((current) => ({ ...current, referenceText: event.target.value }))}
                      />
                    </div>
                  )}

                  {form.category === "CCIR / Critical Incidents" && (
                    <div className="grid gap-1.5">
                      <Label>Short Incident Description / Reference *</Label>
                      <Input
                        placeholder="e.g. Allergic Reaction Incident"
                        value={form.incidentText}
                        onChange={(event) => setForm((current) => ({ ...current, incidentText: event.target.value }))}
                      />
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={form.useCustomTitle}
                      onChange={(event) => setForm((current) => ({ ...current, useCustomTitle: event.target.checked }))}
                      className="h-4 w-4 rounded border-border text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                    Use custom title
                  </label>

                  {form.useCustomTitle && (
                    <div className="grid gap-1.5 [animation:page-enter_180ms_ease-out_both]">
                      <Label>Custom Record Title *</Label>
                      <Input
                        placeholder="Enter a descriptive record title"
                        value={form.customTitle}
                        onChange={(event) => setForm((current) => ({ ...current, customTitle: event.target.value }))}
                      />
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-card px-3 py-2.5" aria-live="polite">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Record title</p>
                    <p className={`mt-1 text-sm ${recordTitle ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {recordTitle || (form.useCustomTitle ? "Enter a custom title above." : "Complete the preset fields to generate a title.")}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-1.5">
                <Label>Record Date</Label>
                <Input type="date" value={form.date} onChange={(event) => handleDateChange(event.target.value)} />
                <p className="text-[11px] text-muted-foreground">Recurring month and year controls default from this date.</p>
              </div>

              <div className="grid gap-1.5">
                <Label>Description / Notes</Label>
                <Textarea
                  placeholder="Add context, notes, or details about this record..."
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Document / Photo</Label>
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/25 px-4 py-6 text-center transition-[border-color,background-color,box-shadow] duration-150 hover:border-primary/40 hover:bg-primary/[0.03] focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-ring/30">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card ring-1 ring-border">
                    <Upload className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-sm text-muted-foreground">Drag &amp; drop or click to select files</span>
                  <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 20MB</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="sr-only"
                    onChange={(event) => setForm((current) => ({ ...current, fileName: event.target.files?.[0]?.name ?? "" }))}
                  />
                </label>
                {form.fileName && (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm [animation:page-enter_180ms_ease-out_both]">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="min-w-0 break-all text-foreground">{form.fileName}</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!canSubmit} className="min-w-28">Upload Record</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
