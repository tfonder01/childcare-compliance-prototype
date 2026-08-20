"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Camera, PackagePlus } from "lucide-react"
import { useApp } from "@/lib/store"
import { CLASSROOM_AGE_GROUPS, SUPPLY_AREAS, SUPPLY_CATEGORIES } from "@/lib/mock-data"
import type { SupplyPriority, SupplyRequest } from "@/lib/types"
import { priorityLabel } from "@/lib/priority-labels"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const fieldClass = "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30 disabled:bg-muted"
const priorities: SupplyPriority[] = ["Low", "Normal", "High", "Urgent"]
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export function NewSupplyRequestModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { role, currentUser, locations, addSupplyRequest } = useApp()
  const [locationId, setLocationId] = useState("")
  const [area, setArea] = useState("")
  const [category, setCategory] = useState("")
  const [itemName, setItemName] = useState("")
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unitCost, setUnitCost] = useState("")
  const [vendor, setVendor] = useState("")
  const [productLink, setProductLink] = useState("")
  const [requestedDate, setRequestedDate] = useState("")
  const [neededBy, setNeededBy] = useState("")
  const [priority, setPriority] = useState<SupplyPriority>("Normal")
  const [approvalRequired, setApprovalRequired] = useState(false)
  const [photoName, setPhotoName] = useState("")
  const total = useMemo(() => Math.max(0, Number(quantity) || 0) * Math.max(0, Number(unitCost) || 0), [quantity, unitCost])

  useEffect(() => {
    if (!open) return
    setLocationId(role === "owner" ? (locations[0]?.id ?? "") : (currentUser.locationId ?? ""))
    setRequestedDate(new Date().toISOString().slice(0, 10))
  }, [open, role, locations, currentUser.locationId])

  const reset = () => {
    setArea(""); setCategory(""); setItemName(""); setDescription(""); setQuantity("1"); setUnitCost("")
    setVendor(""); setProductLink(""); setNeededBy(""); setPriority("Normal"); setApprovalRequired(false); setPhotoName("")
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!locationId || !category || !itemName.trim() || !description.trim() || Number(quantity) <= 0) return
    const timestamp = new Date(`${requestedDate}T12:00:00`).toISOString()
    const isClassroom = CLASSROOM_AGE_GROUPS.includes(area as (typeof CLASSROOM_AGE_GROUPS)[number])
    const request: SupplyRequest = {
      id: `supply_${Date.now()}`, locationId, area: area || undefined,
      classroomAgeGroup: isClassroom ? area as (typeof CLASSROOM_AGE_GROUPS)[number] : undefined,
      category: category as SupplyRequest["category"], itemName: itemName.trim(), description: description.trim(),
      quantity: Number(quantity), unitCost: unitCost ? Number(unitCost) : undefined, estimatedTotal: total,
      vendor: vendor.trim() || undefined, productLink: productLink.trim() || undefined, requestedAt: timestamp,
      neededBy: neededBy || undefined, priority, approvalRequired,
      approvalStatus: approvalRequired ? "Awaiting Approval" : "Not Required", fulfillmentStatus: "Submitted",
      requestedBy: currentUser.name, requestedById: currentUser.id, lastUpdated: timestamp,
      photos: photoName ? [{ name: photoName, uploadedAt: timestamp, uploadedBy: currentUser.name }] : [], archived: false,
    }
    addSupplyRequest(request); reset(); onOpenChange(false)
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl p-0 sm:max-w-3xl">
      <form onSubmit={submit}>
        <DialogHeader className="border-b border-border px-5 py-4 pr-12">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><PackagePlus className="h-4.5 w-4.5" /></div><div><DialogTitle>New Supply Request</DialogTitle><DialogDescription className="mt-1">Request supplies, equipment, or a replacement item.</DialogDescription></div></div>
        </DialogHeader>
        <div className="grid max-h-[68vh] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="supply-location">Location</Label><select id="supply-location" className={fieldClass} value={locationId} onChange={(e) => setLocationId(e.target.value)} disabled={role !== "owner"} required>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select>{role !== "owner" && <p className="text-[11px] text-muted-foreground">Restricted to your assigned location.</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="supply-area">Classroom / Area <span className="font-normal text-muted-foreground">(optional)</span></Label><select id="supply-area" className={fieldClass} value={area} onChange={(e) => setArea(e.target.value)}><option value="">Not specified</option>{SUPPLY_AREAS.map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="space-y-1.5"><Label htmlFor="supply-category">Category</Label><select id="supply-category" className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} required><option value="">Select category</option>{SUPPLY_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></div>
          <div className="space-y-1.5"><Label htmlFor="supply-priority">Priority</Label><select id="supply-priority" className={fieldClass} value={priority} onChange={(e) => setPriority(e.target.value as SupplyPriority)}>{priorities.map((value) => <option key={value} value={value}>{priorityLabel(value)}</option>)}</select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="supply-title">Item / Request Title</Label><Input id="supply-title" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Example: Broken classroom tablet replacement" required /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="supply-description">Description / Reason</Label><Textarea id="supply-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what is needed and why." required /></div>
          <div className="space-y-1.5"><Label htmlFor="supply-quantity">Quantity</Label><Input id="supply-quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="supply-unit-cost">Estimated Unit Cost</Label><div className="relative"><span className="absolute left-2.5 top-1.5 text-sm text-muted-foreground">$</span><Input id="supply-unit-cost" className="pl-6" type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" /></div></div>
          <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 sm:col-span-2"><p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">Estimated Total</p><p className="mt-1 text-xl font-bold tabular-nums text-foreground">{money.format(total)}</p><p className="text-[11px] text-muted-foreground">Quantity × estimated unit cost; taxes and shipping are not included.</p></div>
          <div className="space-y-1.5"><Label htmlFor="supply-vendor">Vendor / Store <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="supply-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor or store" /></div>
          <div className="space-y-1.5"><Label htmlFor="supply-link">Product Link <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="supply-link" type="url" value={productLink} onChange={(e) => setProductLink(e.target.value)} placeholder="https://" /></div>
          <div className="space-y-1.5"><Label htmlFor="supply-date">Requested Date</Label><Input id="supply-date" type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="supply-needed">Needed By <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="supply-needed" type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="supply-photo">Photo upload <span className="font-normal text-muted-foreground">(prototype)</span></Label><label htmlFor="supply-photo" className="flex min-h-20 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/25 px-4 py-3 hover:bg-muted/45"><Camera className="h-5 w-5 text-muted-foreground" /><span className="min-w-0"><span className="block truncate text-sm font-medium">{photoName || "Choose a photo"}</span><span className="text-xs text-muted-foreground">Useful for damaged or replacement items; filename only is stored locally.</span></span></label><Input id="supply-photo" className="sr-only" type="file" accept="image/*" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")} /></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/25 p-3 sm:col-span-2"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" checked={approvalRequired} onChange={(e) => setApprovalRequired(e.target.checked)} /><span><span className="block text-sm font-medium">Approval required before ordering</span><span className="text-xs text-muted-foreground">Owner approval is tracked separately from fulfillment. No permanent cost threshold is configured.</span></span></label>
          <div className="rounded-lg bg-muted/40 px-3 py-2.5 sm:col-span-2"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Requested By</p><p className="mt-0.5 text-sm font-medium">{currentUser.name} · {currentUser.role.replace("_", " ")}</p></div>
        </div>
        <DialogFooter className="m-0"><Button type="button" variant="outline" className="min-h-10 sm:min-h-8" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" className="min-h-10 sm:min-h-8">Submit Request</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}
