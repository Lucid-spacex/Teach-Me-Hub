'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { VerifyRequest } from '@/lib/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Key, CheckCircle2, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react'

export default function VerifyForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<VerifyRequest>({
    email: '',
    otp: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isEmailAutoFilled, setIsEmailAutoFilled] = useState(false)

  useEffect(() => {
    // Auto-populate email from registration
    const storedEmail = sessionStorage.getItem('pendingVerificationEmail')
    if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }))
      setIsEmailAutoFilled(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.verify(formData)
      setSuccess(true)
      toast({
        title: 'Verification Successful',
        description: 'Your account is now active! Please sign in.',
      })
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!formData.email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to resend OTP',
        variant: 'destructive',
      })
      return
    }

    setResending(true)
    try {
      await api.resendOtp(formData.email)
      toast({
        title: 'OTP Resent',
        description: 'A fresh OTP has been sent to your email address',
      })
    } catch (err) {
      toast({
        title: 'Failed to Resend',
        description: err instanceof Error ? err.message : 'Could not resend OTP',
        variant: 'destructive',
      })
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto relative z-10">
        <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-serif">Account Verified!</h2>
              <p className="text-sm text-zinc-400 mt-2">
                Your email is confirmed and your account is ready.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium pt-2">
              <LoadingSpinner size="sm" className="text-primary" />
              <span>Redirecting to login...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
          <BrandHeader />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          Account Verification
        </p>
      </div>

      <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(212,160,23,0.08)] rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Enter Verification Code
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
              OTP
            </span>
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs mt-1">
            We sent a verification code to your registered email address
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
                  readOnly={isEmailAutoFilled}
                  className={`pl-9 bg-muted border-border text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 ${isEmailAutoFilled ? 'cursor-not-allowed opacity-70' : ''}`}
                />
              </div>
              {isEmailAutoFilled && (
                <p className="text-[10px] text-zinc-500">
                  Email auto-filled from registration. No need to change.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="otp" className="text-xs font-medium text-zinc-300">
                  One-Time Code (OTP)
                </Label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[11px] text-primary hover:text-secondary font-medium flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="otp"
                  type="text"
                  required
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  placeholder="e.g. 123456"
                  className="pl-9 bg-muted border-border text-white tracking-widest font-mono placeholder:tracking-normal placeholder:font-sans placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 text-center font-bold text-lg"
                />
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
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/login')}
              className="text-xs text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
