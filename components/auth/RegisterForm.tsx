'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { RegisterRequest } from '@/lib/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Phone, Lock, CheckCircle2, ArrowLeft, ShieldCheck, Sparkles, GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<RegisterRequest & { firstName?: string; lastName?: string; middleName?: string }>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    password: '',
    role: 'PARENT',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Client-side password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter')
      toast({
        title: 'Password Invalid',
        description: 'Password must contain at least one uppercase letter',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    try {
      // Send the fields the backend expects for parent registration
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      }
      const response = await api.register(registrationData)

      // Check if email was sent successfully
      if (response.emailSent === false) {
        toast({
          title: 'Email Not Sent',
          description: 'Verification email could not be sent. Please click "Resend OTP" on the next page.',
          variant: 'destructive',
        })
      }

      // Store email for verification page
      sessionStorage.setItem('pendingVerificationEmail', formData.email)
      setSuccess(true)
      toast({
        title: 'Registration Successful',
        description: 'Please check your email for the verification OTP.',
      })
      // Redirect immediately after success
      router.push('/verify')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'

      // Parse validation errors for better UX
      if (errorMessage.includes('Validation failed') || errorMessage.includes('details')) {
        try {
          const errorObj = JSON.parse(errorMessage)
          if (errorObj.details && Array.isArray(errorObj.details)) {
            const fieldErrors = errorObj.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
            setError(fieldErrors)
          } else {
            setError(errorMessage)
          }
        } catch {
          setError(errorMessage)
        }
      } else {
        setError(errorMessage)
      }

      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto relative z-10">
        <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden">
          <div className="h-1 bg-primary" />
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground font-serif">Welcome to Teachmenest!</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                  Your account has been created. An OTP verification code has been dispatched to your email.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary font-medium pt-2">
                <LoadingSpinner size="sm" className="text-primary" />
                <span>Redirecting to verification...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto relative z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
          <BrandHeader />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          Create Your Free Account
        </p>
      </div>

      {/* Main Register Card */}
      <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(212,160,23,0.08)] rounded-2xl overflow-hidden">
        <div className="h-1 bg-primary opacity-80" />

        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Start Your Learning Journey
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
              Join
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs mt-1">
            Choose your role and enter your details to set up your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher - Only show Parent option */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Account Type</Label>
              <div className="p-1 bg-muted border border-[#282828] rounded-xl">
                <button
                  type="button"
                  disabled
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 bg-primary text-black shadow-md cursor-default"
                >
                  <User className="w-3.5 h-3.5" />
                  Parent
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Want to register as a tutor?{' '}
                <Link href="/register/tutor" className="text-primary hover:text-secondary underline">
                  Go to Tutor Registration
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value })
                  }}
                  placeholder="e.g. Sarah"
                  className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value })
                  }}
                  placeholder="e.g. Jenkins"
                  className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="middleName" className="text-xs font-medium text-muted-foreground">
                Middle Name (Optional)
              </Label>
              <Input
                id="middleName"
                value={formData.middleName || ''}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="Optional"
                className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@example.com"
                    className="pl-9 bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="pl-9 bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters with uppercase letter"
                  className="pl-9 pr-10 bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3.5 py-2.5 rounded-xl text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">Registration Error</p>
                    <p className="text-red-300/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-background font-bold py-2.5 h-11 rounded-xl shadow-[0_4px_20px_rgba(212,160,23,0.3)] transition-all duration-200 transform active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2 text-black" /> : null}
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>

            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Already registered?</span>
              <Link
                href="/login"
                className="text-primary hover:text-secondary font-semibold underline underline-offset-4 decoration-[#D4A017]/40 hover:decoration-[#D4A017]"
              >
                Sign In
              </Link>
            </div>
          </form>

          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-xs text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
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
