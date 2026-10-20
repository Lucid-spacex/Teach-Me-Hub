import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundaryWrapper } from '@/components/shared/ErrorBoundaryWrapper'
import { AuthProvider } from '@/components/shared/AuthProvider'

export const metadata: Metadata = {
  title: 'TeachMeNest — Confident learning starts here',
  description: 'Personalized tutoring that helps every learner feel seen, supported, and ready for what comes next.',
  applicationName: 'TeachMeNest',
  keywords: ['personalized tutoring', 'online learning', 'student progress', 'parent portal'],
}

export const viewport: Viewport = {
  themeColor: '#F3C33F',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
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
