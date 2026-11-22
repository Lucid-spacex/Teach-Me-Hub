import LoginForm from '@/components/auth/LoginForm'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export const metadata = {
  title: 'Admin Sign In | Teachmenest',
  description: 'Administrator sign in.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-secondary/40" aria-hidden="true" />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <LoginForm
        portal="ADMIN"
        title="Administrator Sign In"
        description="Access the admin dashboard"
        showStudentLink={false}
        showRegisterLink={false}
        showForgotPassword={false}
        showBackToHome={false}
        hideStudentLoginBox={true}
      />
    </div>
  )
}
