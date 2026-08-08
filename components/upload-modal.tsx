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
import { Upload, File, CheckCircle2 } from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS } from "@/lib/mock-data"
import type { ComplianceCategory } from "@/lib/types"

const CATEGORIES: ComplianceCategory[] = [
  "Licensing",
  "Health & Safety Drills",
  "Child Files",
  "Staff Files",
  "CCIR / Critical Incidents",
  "Parent Complaints",
  "Staff Complaints",
]

interface UploadModalProps {
  open: boolean
  onClose: () => void
  defaultLocationId?: string
}

export function UploadModal({ open, onClose, defaultLocationId }: UploadModalProps) {
  const { addRecord, currentUser, role } = useApp()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    title: "",
    locationId: defaultLocationId ?? (role === "director" ? currentUser.locationId ?? "" : ""),
    category: "" as ComplianceCategory | "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    relatedRef: "",
    fileName: "",
  })

  const canSubmit = form.title && form.locationId && form.category

  const handleSubmit = () => {
    if (!canSubmit) return
    const now = new Date().toISOString().split("T")[0]
    addRecord({
      id: `rec_${Date.now()}`,
      title: form.title,
      locationId: form.locationId,
      category: form.category as ComplianceCategory,
      status: "New",
      uploadedBy: currentUser.name,
      uploadedById: currentUser.id,
      uploadDate: form.date || now,
      lastUpdated: now,
      description: form.description,
      fileNames: form.fileName ? [form.fileName] : ["Document.pdf"],
      tags: [],
      relatedRef: form.relatedRef || undefined,
    })
    setSubmitted(true)
  }

  const handleClose = () => {
    setSubmitted(false)
    setForm({
      title: "",
      locationId: defaultLocationId ?? (role === "director" ? currentUser.locationId ?? "" : ""),
      category: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      relatedRef: "",
      fileName: "",
    })
    onClose()
  }

  const visibleLocations =
    role === "director"
      ? LOCATIONS.filter((l) => l.id === currentUser.locationId)
      : LOCATIONS

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
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
            <Button onClick={handleClose} className="mt-2">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Upload Compliance Record</DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              {/* Location */}
              <div className="grid gap-1.5">
                <Label>Location *</Label>
                <Select
                  value={form.locationId}
                  onValueChange={(v) => setForm((f) => ({ ...f, locationId: v ?? "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleLocations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="grid gap-1.5">
                <Label>Compliance Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: (v ?? "") as ComplianceCategory | "" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="grid gap-1.5">
                <Label>Record Title *</Label>
                <Input
                  placeholder="e.g. Fire Drill – August 2025"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              {/* Date */}
              <div className="grid gap-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="grid gap-1.5">
                <Label>Description / Notes</Label>
                <Textarea
                  placeholder="Add context, notes, or details about this record..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* File Upload Area */}
              <div className="grid gap-1.5">
                <Label>Document / Photo</Label>
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/25 px-4 py-6 text-center transition-[border-color,background-color,box-shadow] duration-150 hover:border-primary/40 hover:bg-primary/[0.03] focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-ring/30">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card ring-1 ring-border">
                    <Upload className="h-5 w-5 text-primary" />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Drag & drop or click to select files
                  </span>
                  <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 20MB</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="sr-only"
                    onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.files?.[0]?.name ?? "" }))}
                  />
                </label>
                {form.fileName && (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm [animation:page-enter_180ms_ease-out_both]">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{form.fileName}</span>
                  </div>
                )}
              </div>

              {/* Related Ref */}
              <div className="grid gap-1.5">
                <Label>Related Staff / Child Reference</Label>
                <Input
                  placeholder="e.g. Child: Sofia Rivera or Staff: Maria Gonzalez"
                  value={form.relatedRef}
                  onChange={(e) => setForm((f) => ({ ...f, relatedRef: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit} className="min-w-28">
                Upload Record
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
