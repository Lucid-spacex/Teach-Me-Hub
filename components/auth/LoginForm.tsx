'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { LoginRequest } from '@/lib/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Lock, ArrowLeft, User, GraduationCap, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.login(formData)
      toast({
        title: 'Login Successful',
        description: 'Welcome back to Teachmenest!',
      })

      // Set timezone on first login
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      try {
        await api.updateTimezone(timezone)
      } catch (tzError) {
        console.warn('Failed to set timezone:', tzError)
      }

      // Redirect based on user role
      const userRole = localStorage.getItem('userRole')
      if (userRole === 'PARENT') {
        router.push('/parent')
      } else if (userRole === 'TUTOR') {
        router.push('/tutor')
      } else if (userRole === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
          <BrandHeader />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          Parent & Tutor Portal
        </p>
      </div>

      {/* Main Login Card */}
      <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(212,160,23,0.08)] rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
        
        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Sign In to Your Account
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
              Secure
            </span>
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs mt-1">
            Access your student dashboards, live schedules, and learning reports
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-zinc-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="parent@example.com"
                  className="pl-9 bg-muted border-border text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-zinc-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-muted border-border text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary/80 text-background font-bold py-2.5 h-11 rounded-xl shadow-[0_4px_20px_rgba(212,160,23,0.3)] transition-all duration-200 transform active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2 text-black" /> : null}
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>

            <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
              <span>Don&apos;t have an account?</span>
              <Link
                href="/register"
                className="text-primary hover:text-secondary font-semibold underline underline-offset-4 decoration-[#D4A017]/40 hover:decoration-[#D4A017]"
              >
                Create Account
              </Link>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Need to enter OTP?</span>
              <Link
                href="/verify"
                className="text-zinc-400 hover:text-white font-medium"
              >
                Verify Email
              </Link>
            </div>
          </form>

          {/* Quick Switch to Student Login */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#171717] to-card border border-border flex items-center justify-between group hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Are you a Student?</p>
                  <p className="text-[10px] text-zinc-400">Sign in with your Student Code & PIN</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/student-login')}
                className="text-xs text-primary hover:text-white hover:bg-primary/20 font-semibold h-8 px-2.5 rounded-lg"
              >
                Student Login →
              </Button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-xs text-zinc-500 hover:text-zinc-300 hover:bg-transparent"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
