import { TutorLayoutClient } from '@/components/tutor/TutorLayoutClient'

export const metadata = {
  title: 'Tutor Portal | Teachmenest',
  description: 'Manage your students, sessions, assignments, and grades.',
}

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TutorLayoutClient>{children}</TutorLayoutClient>
}

