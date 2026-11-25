'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { AuthGuard } from '@/components/shared/AuthGuard'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AuthGuard requiredRole="ADMIN" loginPath="/admin/login">
      <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Sidebar role="ADMIN" />
        <main className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
          <div className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 py-5 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
