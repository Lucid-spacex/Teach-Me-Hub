import { Sidebar } from '@/components/shared/Sidebar'

export const metadata = {
  title: 'Admin Portal | Teachmenest',
  description: 'Manage tutors, students, enrollments, and platform settings.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      <Sidebar role="ADMIN" />
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
