import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

export const metadata = {
  title: 'Admin Portal | Teachmenest',
  description: 'Manage tutors, students, enrollments, and platform settings.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}

