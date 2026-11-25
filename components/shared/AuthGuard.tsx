'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole: 'PARENT' | 'TUTOR' | 'ADMIN' | 'STUDENT'
  loginPath: string
}

export function AuthGuard({ children, requiredRole, loginPath }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const user = getUser()
  const role = getUserRole()

  const isLoginPage = pathname === loginPath || pathname.startsWith(loginPath + '/')

  useEffect(() => {
    if (!isLoginPage && (!user || role !== requiredRole)) {
      router.push(loginPath)
    }
  }, [user, role, requiredRole, loginPath, router, isLoginPage])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!user || role !== requiredRole) {
    return null
  }

  return <>{children}</>
}

