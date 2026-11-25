import { Sidebar } from '@/components/shared/Sidebar'
import { AuthGuard } from '@/components/shared/AuthGuard'

export const metadata = {
  title: 'Parent Portal | Teachmenest',
  description: 'Manage your children, enrollments, sessions, and academic progress on Teachmenest.',
}

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="PARENT" loginPath="/login">
      <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Sidebar role="PARENT" />
        <main className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
          <div className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 py-5 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
