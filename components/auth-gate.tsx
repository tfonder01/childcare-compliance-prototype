"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, isProductionMode } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isProductionMode && status === "anonymous") router.replace("/login")
  }, [isProductionMode, status, router])

  if (!isProductionMode) return children
  if (status !== "authenticated") {
    return <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Checking your session…</main>
  }
  return children
}
