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
  Shield,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/store"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Compliance Records", href: "/records", icon: FileText },
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
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-[oklch(0.32_0.02_240)] bg-[oklch(0.22_0.02_240)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[oklch(0.32_0.02_240)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.42_0.13_240)]">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[oklch(0.95_0.01_240)] leading-tight">ComplianceIQ</p>
          <p className="text-[10px] text-[oklch(0.65_0.02_240)] leading-tight">Childcare Operations</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[oklch(0.65_0.02_240)] hover:bg-[oklch(0.30_0.025_240)] hover:text-white lg:hidden"
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
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[oklch(0.42_0.13_240)] text-white"
                      : "text-[oklch(0.72_0.02_240)] hover:bg-[oklch(0.30_0.025_240)] hover:text-[oklch(0.95_0.01_240)]"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
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
      <div className="border-t border-[oklch(0.32_0.02_240)] p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              role === "owner"
                ? "bg-violet-500/20 text-violet-300"
                : "bg-teal-500/20 text-teal-300"
            )}
          >
            {currentUser.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[oklch(0.88_0.01_240)]">
              {currentUser.name}
            </p>
            <p className="text-[10px] capitalize text-[oklch(0.58_0.02_240)]">{currentUser.role}</p>
          </div>
          <div
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              role === "owner" ? "bg-violet-400" : "bg-teal-400"
            )}
          />
        </div>
      </div>
    </aside>
  )
}
