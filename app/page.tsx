'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, GraduationCap, ShieldCheck } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user) {
      const role = getUserRole()
      if (role === 'PARENT') {
        router.push('/parent')
      } else if (role === 'TUTOR') {
        router.push('/tutor')
      } else if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'STUDENT') {
        router.push('/student')
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-gold/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <BrandHeader />
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-12">
          {/* Hero Text */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-serif font-bold text-white">
              Learn. Grow. <span className="text-brand-gold">Thrive.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Personalized tutoring that connects families with expert educators for transformative learning experiences.
            </p>
          </div>

          {/* Login Options */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Parent/Tutor Login */}
            <Card className="bg-card border-brand-gold/30 hover:border-brand-gold transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-brand-gold" />
                </div>
                <CardTitle className="text-white">Parent or Tutor</CardTitle>
                <CardDescription className="text-gray-400">
                  Access your dashboard to manage students, schedules, and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                >
                  Login
                </Button>
              </CardContent>
            </Card>

            {/* Student Login */}
            <Card className="bg-card border-brand-gold/30 hover:border-brand-gold transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-brand-gold" />
                </div>
                <CardTitle className="text-white">Student</CardTitle>
                <CardDescription className="text-gray-400">
                  Access your learning portal with your student code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/student-login')}
                  className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                >
                  Student Portal
                </Button>
              </CardContent>
            </Card>

            {/* Register */}
            <Card className="bg-card border-brand-gold/30 hover:border-brand-gold transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-brand-gold/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-brand-gold" />
                </div>
                <CardTitle className="text-white">New Parent/Tutor</CardTitle>
                <CardDescription className="text-gray-400">
                  Create an account to get started with Teachmenest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/register')}
                  variant="outline"
                  className="w-full border-brand-gold text-brand-gold hover:bg-brand-gold/10"
                >
                  Register
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-gold/20 p-6 text-center text-gray-400 text-sm">
        <p>© 2024 Teachmenest. All rights reserved.</p>
      </footer>
    </div>
  )
}
