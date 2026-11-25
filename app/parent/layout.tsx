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
      <div data-role="parent" className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Sidebar role="PARENT" />
        <main className="min-w-0 flex-1 xl:pl-72 flex flex-col min-h-screen">
          <div className="dashboard-content flex-1">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
