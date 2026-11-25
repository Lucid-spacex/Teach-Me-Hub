import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { AuthProvider } from '@/components/shared/AuthProvider'
import { ErrorBoundaryWrapper } from '@/components/shared/ErrorBoundaryWrapper'
import { NotificationProvider } from '@/components/shared/NotificationProvider'
import { PageTransition } from '@/components/shared/PageTransition'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const displayFont = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display-family',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TeachMeNest — Confident learning starts here',
  description: 'Personalized tutoring that helps every learner feel seen, supported, and ready for what comes next.',
  applicationName: 'TeachMeNest',
  keywords: ['personalized tutoring', 'online learning', 'student progress', 'parent portal'],
}

export const viewport: Viewport = {
  themeColor: '#E3B52F',
  colorScheme: 'light dark',
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
      <body className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-background text-foreground`}>
        <ErrorBoundaryWrapper>
          <AuthProvider>
            <NotificationProvider>
              <PageTransition>{children}</PageTransition>
            </NotificationProvider>
          </AuthProvider>
        </ErrorBoundaryWrapper>
        <Toaster />
      </body>
    </html>
  )
}
