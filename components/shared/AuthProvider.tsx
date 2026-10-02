'use client'

import { useEffect, useState } from 'react'
import { syncUserWithServer, getUser } from '@/lib/auth'
import { User } from '@/lib/types'
import { AlertTriangle, X } from 'lucide-react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return typeof window !== 'undefined' ? getUser() : null
  })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Reconcile user with GET /auth/me on app load
    syncUserWithServer().then((freshUser) => {
      if (freshUser) {
        setUser(freshUser)
      }
    })

    const handleUserChanged = (event: Event) => {
      const customEvent = event as CustomEvent<User | null>
      setUser(customEvent.detail ?? getUser())
    }

    window.addEventListener('auth:user-changed', handleUserChanged)
    return () => {
      window.removeEventListener('auth:user-changed', handleUserChanged)
    }
  }, [])

  const isSuspended = user?.status === 'SUSPENDED'
  const isRejected = user?.status === 'REJECTED'

  return (
    <>
      {(isSuspended || isRejected) && !dismissed && (
        <div className="bg-destructive/90 text-white text-xs sm:text-sm font-medium px-4 py-2.5 flex items-center justify-between shadow-md z-50 relative sticky top-0">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
            <span>
              {isSuspended
                ? 'Your account has been suspended. Platform actions may be restricted. Please contact support.'
                : 'Your profile registration was not approved. Please contact support or update your application.'}
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {children}
    </>
  )
}
