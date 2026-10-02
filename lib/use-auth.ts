'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUser, setUser, syncUserWithServer, clearUser } from '@/lib/auth'
import { User } from '@/lib/types'

export function useAuth() {
  const [user, setUserState] = useState<User | null>(() => {
    return typeof window !== 'undefined' ? getUser() : null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUser = useCallback(async () => {
    try {
      // 1. Initial fast paint from cached localStorage
      const cached = getUser()
      if (cached) {
        setUserState(cached)
      }

      // 2. Fetch fresh user data from server (source of truth)
      const freshUser = await syncUserWithServer()
      setUserState(freshUser)
      setError(null)
    } catch (err) {
      console.error('Failed to sync auth user:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()

    const handleUserChanged = (event: Event) => {
      const customEvent = event as CustomEvent<User | null>
      setUserState(customEvent.detail ?? getUser())
    }

    window.addEventListener('auth:user-changed', handleUserChanged)
    return () => {
      window.removeEventListener('auth:user-changed', handleUserChanged)
    }
  }, [loadUser])

  const refreshUser = async () => {
    setLoading(true)
    await loadUser()
  }

  const isSuspended = user?.status === 'SUSPENDED'
  const isRejected = user?.status === 'REJECTED'

  return {
    user,
    loading,
    error,
    isSuspended,
    isRejected,
    refreshUser,
  }
}

export { getUser as getCachedUser, setUser as setCachedUser, clearUser as clearCachedUser }
