import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundaryWrapper } from '@/components/shared/ErrorBoundaryWrapper'

export const metadata: Metadata = {
  title: 'Smart Tutor Platform',
  description: 'Tutoring platform for parents, tutors, and admins',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <ErrorBoundaryWrapper>
          {children}
        </ErrorBoundaryWrapper>
        <Toaster />
      </body>
    </html>
  )
}
