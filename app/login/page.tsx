"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const { login, status, isProductionMode } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isProductionMode || status === "authenticated") router.replace("/dashboard")
  }, [isProductionMode, status, router])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true)
    try { await login(email, password); router.replace("/dashboard") }
    catch (cause) { setError(cause instanceof ApiClientError ? cause.message : "Unable to sign in") }
    finally { setSubmitting(false) }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <section className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm" aria-labelledby="login-title">
        <div className="mb-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">IM</div>
          <h1 id="login-title" className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Influential Management Operations &amp; Compliance</p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required maxLength={200} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</Button>
        </form>
      </section>
    </main>
  )
}
