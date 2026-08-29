'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { VerifyRequest } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Key, CheckCircle, AlertCircle, GraduationCap, Sparkles } from 'lucide-react'

export default function VerifyForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<VerifyRequest>({
    email: '',
    otp: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.verify(formData)
      setSuccess(true)
      toast({
        title: "Verification Successful",
        description: "Your account has been verified",
      })
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Verification Successful</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Your account has been verified. Redirecting to login...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Tutor</h1>
          <p className="text-gray-600">Verify your account to get started</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Verify Account</CardTitle>
            <CardDescription className="text-center">
              Enter the OTP code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  Enter the 6-digit OTP code sent to your email. If you didn't receive it, please contact support.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-9 h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">OTP Code</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    placeholder="123456"
                    maxLength={6}
                    className="pl-9 h-11 border-gray-200 focus:border-blue-500 font-mono text-center tracking-widest text-lg"
                  />
                </div>
                <p className="text-xs text-gray-500">Enter the 6-digit code from your email</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {loading ? 'Verifying...' : 'Verify Account'}
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-gray-600">Already verified?{' '}</span>
                <Button 
                  variant="link" 
                  className="px-0 h-auto text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => router.push('/login')}
                >
                  Sign in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>One step closer to your learning journey</span>
          </div>
        </div>
      </div>
    </div>
  )
}
