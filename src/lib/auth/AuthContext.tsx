import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../supabase'

export interface AuthResult {
  error: string | null
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  /** False when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. */
  configured: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Turns Supabase's English auth errors into the Uzbek copy this app uses. */
function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email yoki parol noto‘g‘ri.'
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'Bu email allaqachon ro‘yxatdan o‘tgan.'
  }
  if (m.includes('password should be at least') || m.includes('at least 6')) {
    return 'Parol kamida 6 belgidan iborat bo‘lishi kerak.'
  }
  if (m.includes('invalid email') || m.includes('unable to validate email')) {
    return 'Email manzili noto‘g‘ri.'
  }
  if (m.includes('rate limit')) return 'Juda ko‘p urinish. Birozdan so‘ng qayta urinib ko‘ring.'
  if (m.includes('network')) return 'Internetga ulanishda muammo. Qayta urinib ko‘ring.'
  return 'Xatolik yuz berdi. Qaytadan urinib ko‘ring.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase sozlanmagan. .env faylini tekshiring.' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: translateAuthError(error.message) }
    return { error: null }
  }

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase sozlanmagan. .env faylini tekshiring.' }
    }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: translateAuthError(error.message) }
    return { error: null }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, session, loading, configured: isSupabaseConfigured, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak.')
  return ctx
}
