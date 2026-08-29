'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { RegisterRequest } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SegmentedControl } from '@/components/shared/SegmentedControl'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Phone, Lock, CheckCircle, GraduationCap, Sparkles } from 'lucide-react'

export default function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'PARENT',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.register(formData)
      setSuccess(true)
      toast({
        title: "Registration Successful",
        description: "Please check your email for the OTP verification code",
      })
      setTimeout(() => {
        router.push('/verify')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      toast({
        title: "Registration Failed",
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
                <h2 className="text-xl font-bold text-gray-900">Registration Successful</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Please check your email for the OTP verification code
                </p>
              </div>
              <div className="text-sm text-gray-500">Redirecting to verification page...</div>
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
          <p className="text-gray-600">Join our community of learners and educators</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to get started with Smart Tutor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">I am a</Label>
                <SegmentedControl
                  options={[
                    { value: 'PARENT', label: 'Parent' },
                    { value: 'TUTOR', label: 'Tutor' },
                  ]}
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value as 'PARENT' | 'TUTOR' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="pl-9 h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

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
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="pl-9 h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="pl-9 h-11 border-gray-200 focus:border-blue-500"
                  />
                </div>
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
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-gray-600">Already have an account?{' '}</span>
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
            <span>Start your learning journey today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
