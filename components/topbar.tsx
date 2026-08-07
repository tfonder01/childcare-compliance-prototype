"use client"

import { Bell, Upload, ChevronDown, Check, Menu } from "lucide-react"
import { useState } from "react"
import { useApp } from "@/lib/store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { UploadModal } from "@/components/upload-modal"
import Link from "next/link"
import { usePathname } from "next/navigation"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/records": "Compliance Records",
  "/locations": "Locations",
  "/needs-review": "Needs Review",
  "/activity": "Activity",
  "/archived": "Archived Records",
  "/settings": "Settings",
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { role, setRole, currentUser, notifications, unreadCount, markAllNotificationsRead, markNotificationRead } =
    useApp()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const pathname = usePathname()

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) => pathname === path || pathname.startsWith(path + "/"))?.[1] ??
    "ComplianceIQ"

  const recentNotifs = notifications.slice(0, 5)

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    role === "owner" ? "bg-violet-500" : "bg-teal-500"
                  )}
                />
                View as: {role === "owner" ? "Owner" : "Director"}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Demo Role Switcher</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setRole("owner")} className="gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                Owner / Admin
                {role === "owner" && <Check className="ml-auto h-3.5 w-3.5" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRole("director")} className="gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                Director
                {role === "director" && <Check className="ml-auto h-3.5 w-3.5" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Upload Button */}
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            Upload Record
          </Button>

          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              {recentNotifs.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                recentNotifs.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex-col items-start gap-0.5 px-3 py-2"
                    onClick={() => {
                      markNotificationRead(n.id)
                      if (n.recordId) setNotifOpen(false)
                    }}
                    asChild={!!n.recordId}
                  >
                    {n.recordId ? (
                      <Link href={`/records/${n.recordId}`} className="flex w-full flex-col items-start gap-0.5">
                        <div className="flex w-full items-start gap-2">
                          {!n.isRead && (
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          )}
                          <div className={cn("flex-1", n.isRead && "ml-3.5")}>
                            <p className="text-xs font-medium leading-tight">{n.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{n.message}</p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {n.timestamp.slice(0, 10)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex w-full items-start gap-2">
                        {!n.isRead && (
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        )}
                        <div className={cn("flex-1", n.isRead && "ml-3.5")}>
                          <p className="text-xs font-medium leading-tight">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{n.message}</p>
                        </div>
                      </div>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {currentUser.initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  )
}
