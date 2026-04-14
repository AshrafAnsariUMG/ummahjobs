'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  role: string | null
  isLoading: boolean
  isAuthenticated: boolean
  unreadMessages: number
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    const storedToken = localStorage.getItem('uj_token')
    const storedUser = localStorage.getItem('uj_user')

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser)
        setUser(parsedUser)
        setToken(storedToken)

        api.get('/api/auth/me')
          .then((data: { user: User; unread_messages?: number }) => {
            setUser(data.user)
            localStorage.setItem('uj_user', JSON.stringify(data.user))
            if (data.unread_messages !== undefined) {
              setUnreadMessages(data.unread_messages)
            }
          })
          .catch(() => {
            localStorage.removeItem('uj_token')
            localStorage.removeItem('uj_user')
            setUser(null)
            setToken(null)
          })
          .finally(() => setIsLoading(false))
      } catch {
        localStorage.removeItem('uj_token')
        localStorage.removeItem('uj_user')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  function login(newToken: string, newUser: User) {
    localStorage.setItem('uj_token', newToken)
    localStorage.setItem('uj_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    api.post('/api/auth/logout').catch(() => {})
    localStorage.removeItem('uj_token')
    localStorage.removeItem('uj_user')
    setToken(null)
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role ?? null,
        isLoading,
        isAuthenticated: !!user && !!token,
        unreadMessages,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
