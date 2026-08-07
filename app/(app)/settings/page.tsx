"use client"

import { Shield, MapPin, Users, Bell, Database } from "lucide-react"
import { useApp } from "@/lib/store"
import { LOCATIONS, USERS } from "@/lib/mock-data"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { role, currentUser } = useApp()

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Profile */}
      <Section title="Your Profile">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${
              role === "owner" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"
            }`}
          >
            {currentUser.initials}
          </div>
          <div>
            <p className="font-semibold text-foreground">{currentUser.name}</p>
            <p className="text-sm capitalize text-muted-foreground">{currentUser.role}</p>
            {currentUser.locationId && (
              <p className="text-xs text-muted-foreground">
                {LOCATIONS.find((l) => l.id === currentUser.locationId)?.name}
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Locations */}
      {role === "owner" && (
        <Section title="Locations">
          <div className="space-y-3">
            {LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{loc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Director: {loc.director} &middot; Capacity: {loc.capacity}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{loc.phone}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            To add or remove locations, contact your system administrator.
          </p>
        </Section>
      )}

      {/* Team */}
      {role === "owner" && (
        <Section title="Team Members">
          <div className="space-y-3">
            {USERS.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    user.role === "owner"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  {user.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {user.role}
                    {user.locationId && (
                      <> &middot; {LOCATIONS.find((l) => l.id === user.locationId)?.name}</>
                    )}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    user.role === "owner"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-teal-100 text-teal-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Full user management (invite, deactivate, role changes) will be available in a future release.
          </p>
        </Section>
      )}

      {/* Notifications */}
      <Section title="Notifications">
        <div className="space-y-3">
          {[
            { label: "New record uploaded", description: "Notify when any director uploads a new record" },
            { label: "Record marked Needs Attention", description: "Notify when a record requires follow-up" },
            { label: "Director adds a comment", description: "Notify when a comment is added to a record" },
            { label: "Record reviewed", description: "Notify when a record is marked reviewed" },
          ].map(({ label, description }) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <span className="mt-0.5 shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                On
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Email and push notification settings will be configurable in a future release. Currently all in-app notifications are enabled.
        </p>
      </Section>

      {/* Compliance Categories */}
      <Section title="Compliance Categories">
        <div className="flex flex-wrap gap-2">
          {[
            "Licensing",
            "Health & Safety Drills",
            "Child Files",
            "Staff Files",
            "CCIR / Critical Incidents",
            "Parent Complaints",
            "Staff Complaints",
          ].map((cat) => (
            <span
              key={cat}
              className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {cat}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Category management will be available in a future release. Categories can be customized per regulatory requirements.
        </p>
      </Section>

      {/* Coming Soon */}
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-muted-foreground">Coming Soon</p>
        </div>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Full user management (invite, deactivate, role assignment)</li>
          <li>• Email and push notification configuration</li>
          <li>• Audit log export (CSV, PDF)</li>
          <li>• Custom compliance category management</li>
          <li>• SSO / single sign-on integration</li>
        </ul>
      </div>
    </div>
  )
}
