'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { LoginRequest } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Mail, Lock, GraduationCap, Sparkles } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.login(formData)
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
      
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
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          <p className="text-gray-600">Your personalized learning journey starts here</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    className="pl-9 h-11 border-gray-200 text-black focus:border-blue-500"
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
                    className="pl-9 h-11 border-gray-200 text-black focus:border-blue-500"
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm space-y-3 pt-2">
                <div className="text-gray-600">
                  Don't have an account?{' '}
                  <Button 
                    variant="link" 
                    className="px-0 h-auto text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => router.push('/register')}
                  >
                    Sign up
                  </Button>
                </div>
                <div className="text-gray-600">
                  Need to verify your account?{' '}
                  <Button 
                    variant="link" 
                    className="px-0 h-auto text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => router.push('/verify')}
                  >
                    Verify
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Empowering education through personalized tutoring</span>
          </div>
        </div>
      </div>
    </div>
  )
}
