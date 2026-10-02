import { Sidebar } from '@/components/shared/Sidebar'

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
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      <Sidebar role="PARENT" />
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
