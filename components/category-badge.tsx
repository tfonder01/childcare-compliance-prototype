import { cn } from "@/lib/utils"
import type { ComplianceCategory } from "@/lib/types"

const CATEGORY_CONFIG: Record<ComplianceCategory, { className: string }> = {
  Licensing: { className: "bg-violet-50 text-violet-700 border-violet-200" },
  "Health & Safety": { className: "bg-teal-50 text-teal-700 border-teal-200" },
  Drills: { className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  "Child Files": { className: "bg-sky-50 text-sky-700 border-sky-200" },
  "Staff Files": { className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  "Classroom Observations": { className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "CCIR / Critical Incidents": { className: "bg-red-50 text-red-700 border-red-200" },
  "Parent Complaints": { className: "bg-orange-50 text-orange-700 border-orange-200" },
  "Staff Complaints": { className: "bg-pink-50 text-pink-700 border-pink-200" },
}

interface CategoryBadgeProps {
  category: ComplianceCategory
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {category}
    </span>
  )
}
