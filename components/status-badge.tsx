import { cn } from "@/lib/utils"
import type { RecordStatus } from "@/lib/types"

const STATUS_CONFIG: Record<
  RecordStatus,
  { label: string; className: string }
> = {
  New: {
    label: "New",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Reviewed: {
    label: "Reviewed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "Needs Attention": {
    label: "Needs Attention",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Archived: {
    label: "Archived",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
}

interface StatusBadgeProps {
  status: RecordStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
