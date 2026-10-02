import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundaryWrapper } from '@/components/shared/ErrorBoundaryWrapper'
import { AuthProvider } from '@/components/shared/AuthProvider'

export const metadata: Metadata = {
  title: 'Teachmenest - Learn. Grow. Thrive.',
  description: 'Teachmenest tutoring platform connecting parents, tutors, and students for personalized learning experiences.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ErrorBoundaryWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundaryWrapper>
        <Toaster />
      </body>
    </html>
  )
}
