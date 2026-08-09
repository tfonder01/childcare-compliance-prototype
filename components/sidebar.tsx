"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  MapPin,
  AlertCircle,
  MessageSquare,
  Archive,
  Settings,
  X,
  Wrench,
  PackageSearch,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Compliance", href: "/records", icon: FileText },
  { label: "Operations", href: "/operations", icon: ClipboardList },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Supply Requests", href: "/supply-requests", icon: PackageSearch },
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Needs Review", href: "/needs-review", icon: AlertCircle },
  { label: "Activity", href: "/activity", icon: MessageSquare },
  { label: "Archived", href: "/archived", icon: Archive },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { records, role, currentUser } = useApp()

  const needsReviewCount = records.filter(
    (r) => r.status === "New" || r.status === "Needs Attention"
  ).length

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar shadow-xl shadow-slate-950/10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
          <span className="text-xs font-bold tracking-wide text-white">IM</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-tight text-sidebar-foreground">Influential Management</p>
          <p className="mt-0.5 text-[10px] leading-tight text-sidebar-foreground/55">Operations &amp; Compliance</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors duration-150 hover:bg-sidebar-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/")) || pathname === href
            const badge = label === "Needs Review" ? needsReviewCount : null

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    isActive
                      ? "bg-sidebar-primary text-white before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-amber-300"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0 transition-[opacity,transform] duration-150", isActive ? "opacity-100" : "opacity-75 group-hover:translate-x-px group-hover:opacity-100")} />
                  <span className="flex-1">{label}</span>
                  {badge ? (
                    <span
                      className={cn(
                        "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-amber-400/20 text-amber-300"
                      )}
                    >
                      {badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.035] px-3 py-2.5 shadow-inner shadow-black/5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              role === "owner"
                ? "bg-violet-500/20 text-violet-200"
                : role === "director"
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-blue-500/20 text-blue-200"
            )}
          >
            {currentUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-foreground">
              {currentUser.name}
            </p>
            <p className="text-[10px] capitalize text-sidebar-foreground/50">{currentUser.role.replace("_", " ")}</p>
          </div>
          <div
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              role === "owner" ? "bg-violet-300" : role === "director" ? "bg-emerald-300" : "bg-blue-300"
            )}
          />
        </div>
        <p className="mt-2 text-center text-[9px] tracking-wide text-sidebar-foreground/35">Powered by SentryPoint Systems</p>
      </div>
    </aside>
  )
}
