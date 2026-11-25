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
      <div data-role="admin" className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Sidebar role="ADMIN" />
        <main className="min-w-0 flex-1 xl:pl-72 flex flex-col min-h-screen">
          <div className="dashboard-content flex-1">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
