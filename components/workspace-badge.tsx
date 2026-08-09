import { cn } from "@/lib/utils"
import type { RecordWorkspace } from "@/lib/types"

export function WorkspaceBadge({
  workspace,
  className,
}: {
  workspace: RecordWorkspace
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        workspace === "operations"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-slate-50 text-slate-700",
        className
      )}
    >
      {workspace === "operations" ? "Operations" : "Compliance"}
    </span>
  )
}
