"use client"

import { CheckCircle2, X } from "lucide-react"

export interface ToastMessage {
  id: number
  message: string
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-80"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg [animation:toast-enter_180ms_ease-out_both]"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="flex-1 font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
