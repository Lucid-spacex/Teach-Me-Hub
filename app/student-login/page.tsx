import StudentLoginForm from '@/components/auth/StudentLoginForm'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export const metadata = {
  title: 'Student Login | Teachmenest',
  description: 'Log in to the Teachmenest Student Portal using your student code and PIN.',
}

export default function StudentLoginPage() {
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-gold/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid line pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <StudentLoginForm />
    </div>
  )
}