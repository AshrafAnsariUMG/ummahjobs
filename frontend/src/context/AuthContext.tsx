'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getStorageUrl } from '@/lib/imageUtils'
import type { User } from '@/types'

interface MeProfile {
  // candidate
  profile_photo_path?: string | null
  // employer
  logo_path?: string | null
}

interface AuthContextValue {
  user: User | null
  token: string | null
  role: string | null
  isLoading: boolean
  isAuthenticated: boolean
  unreadMessages: number
  profilePhotoUrl: string | null
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function resolvePhotoFrom(profile: MeProfile | null | undefined): string | null {
  if (!profile) return null
  return getStorageUrl(profile.profile_photo_path) ?? getStorageUrl(profile.logo_path) ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    try {
      const data = await api.get('/api/auth/me') as { user: User; profile?: MeProfile; unread_messages?: number }
      setUser(data.user)
      localStorage.setItem('uj_user', JSON.stringify(data.user))
      setProfilePhotoUrl(resolvePhotoFrom(data.profile))
      if (data.unread_messages !== undefined) setUnreadMessages(data.unread_messages)
    } catch {
      // swallow — caller has no good fallback
    }
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem('uj_token')
    const storedUser = localStorage.getItem('uj_user')

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser)
        setUser(parsedUser)
        setToken(storedToken)

        api.get('/api/auth/me')
          .then((data: { user: User; profile?: MeProfile; unread_messages?: number }) => {
            setUser(data.user)
            localStorage.setItem('uj_user', JSON.stringify(data.user))
            setProfilePhotoUrl(resolvePhotoFrom(data.profile))
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

  function updateUser(updatedUser: User) {
    localStorage.setItem('uj_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  function logout() {
    api.post('/api/auth/logout').catch(() => {})
    localStorage.removeItem('uj_token')
    localStorage.removeItem('uj_user')
    setToken(null)
    setUser(null)
    setProfilePhotoUrl(null)
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
        profilePhotoUrl,
        login,
        logout,
        updateUser,
        refreshProfile,
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
