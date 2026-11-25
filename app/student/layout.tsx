import { Sidebar } from '@/components/shared/Sidebar'
import { AuthGuard } from '@/components/shared/AuthGuard'

export const metadata = {
  title: 'Student Portal | Teachmenest',
  description: 'View your class schedule, assignments, grades, and learning progress on Teachmenest.',
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="STUDENT" loginPath="/student-login">
      <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Sidebar role="STUDENT" />
        <main className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
          <div className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 py-5 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
