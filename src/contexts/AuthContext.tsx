import { createContext, useContext, useMemo, useState } from 'react'

type AuthState = { user: string | null }
type AuthCtx = {
  user: string | null
  login: (u: string, p: string) => boolean
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: any }) {
  const [state, setState] = useState<AuthState>({ user: null })
  const login = (u: string, p: string) => {
    const envU = import.meta.env.VITE_ADMIN_USER || 'rest'
    const envP = import.meta.env.VITE_ADMIN_PASS || '1234'
    const ok = String(u) === String(envU) && String(p) === String(envP)
    if (ok) setState({ user: u })
    return ok
  }
  const logout = () => setState({ user: null })
  const value = useMemo(() => ({ user: state.user, login, logout }), [state.user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('AuthContext')
  return v
}