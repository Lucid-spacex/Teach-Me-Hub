'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { AuthGuard } from '@/components/shared/AuthGuard'

export function TutorLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicPage =
    pathname === '/tutor/login' ||
    pathname.startsWith('/tutor/login/') ||
    pathname === '/tutor/register' ||
    pathname.startsWith('/tutor/register/')

  if (isPublicPage) {
    return <>{children}</>
  }

  return (
    <AuthGuard requiredRole="TUTOR" loginPath="/tutor/login">
      <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Sidebar role="TUTOR" />
        <main className="min-w-0 flex-1 xl:pl-72 flex flex-col min-h-screen">
          <div className="min-w-0 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
