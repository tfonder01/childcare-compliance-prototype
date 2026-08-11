"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { apiClient, type SessionUser } from "./api-client"

type AuthStatus = "loading" | "authenticated" | "anonymous"
interface AuthContextValue {
  status: AuthStatus
  user: SessionUser | null
  isProductionMode: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
export const isProductionAuthMode = process.env.NEXT_PUBLIC_APP_MODE === "production"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isProductionAuthMode ? "loading" : "authenticated")
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    if (!isProductionAuthMode) return
    apiClient.restoreSession()
      .then((session) => { setUser(session.user); setStatus("authenticated") })
      .catch(() => { setUser(null); setStatus("anonymous") })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiClient.login(email, password)
    setUser(session.user)
    setStatus("authenticated")
  }, [])

  const logout = useCallback(async () => {
    await apiClient.logout()
    setUser(null)
    setStatus("anonymous")
  }, [])

  const value = useMemo(() => ({ status, user, isProductionMode: isProductionAuthMode, login, logout }), [status, user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error("useAuth must be used within AuthProvider")
  return value
}
