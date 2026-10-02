'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { GraduationCap, ArrowLeft, Loader2, AlertCircle, Sparkles, Mail, Hash, KeyRound, User, Eye, EyeOff } from 'lucide-react'

const studentLoginSchema = z.object({
  parentEmail: z.string().email('Invalid email address'),
  studentCode: z.string().min(1, 'Student code is required'),
  studentPin: z.string().min(6, 'PIN must be exactly 6 digits').max(6, 'PIN must be exactly 6 digits').regex(/^\d{6}$/, 'PIN must contain only numbers'),
})

type StudentLoginFormData = z.infer<typeof studentLoginSchema>

export default function StudentLoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<StudentLoginFormData>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      parentEmail: '',
      studentCode: '',
      studentPin: '',
    },
    mode: 'onChange',
  })

  const handlePinChange = (index: number, value: string) => {
    if (rateLimitError) setRateLimitError(null)
    if (loginError) setLoginError(null)

    if (!/^\d*$/.test(value)) return

    const newDigits = [...pinDigits]
    newDigits[index] = value.slice(-1)
    setPinDigits(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    const fullPin = newDigits.join('')
    setValue('studentPin', fullPin)
    
    if (fullPin.length === 6) {
      trigger('studentPin')
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    
    if (/^\d+$/.test(pastedData)) {
      const newDigits = [...pinDigits]
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i]
      }
      setPinDigits(newDigits)
      setValue('studentPin', newDigits.join(''))
      
      const nextEmptyIndex = newDigits.findIndex(d => d === '')
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      } else {
        inputRefs.current[5]?.focus()
      }
    }
  }

  const onSubmit = async (data: StudentLoginFormData) => {
    setRateLimitError(null)
    setLoginError(null)

    if (pinDigits.some(digit => digit === '')) {
      toast({
        title: 'Incomplete PIN',
        description: 'Please enter all 6 digits of your PIN',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await api.studentLogin(data)
      toast({
        title: 'Login successful',
        description: 'Welcome to your student portal!',
      })
      router.push('/student')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid credentials'
      
      if (errorMessage.includes('Too many attempts') || errorMessage.includes('try again') || errorMessage.toLowerCase().includes('rate limit')) {
        setRateLimitError(errorMessage)
        toast({
          title: 'Too many login attempts',
          description: errorMessage,
          variant: 'destructive',
        })
      } else {
        // Treat all other errors as invalid credentials (including "session expired" from backend)
        setLoginError('Invalid credentials. Please check your email, student code, and PIN.')
        toast({
          title: 'Login failed',
          description: 'Invalid credentials. Please check your email, student code, and PIN.',
          variant: 'destructive',
        })
        // Ensure we stay on the student login page and don't redirect
        // The form submission is already prevented by e.preventDefault()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto relative z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
          <BrandHeader />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center justify-center gap-1.5">
          <GraduationCap className="w-4 h-4" />
          Student Learning Portal
        </p>
      </div>

      {/* Main Student Login Card */}
      <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(212,160,23,0.08)] rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Student Sign In
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-secondary border border-primary/30 font-medium">
              Student ID
            </span>
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs mt-1">
            Enter your Parent&apos;s email, your Student Code, and 6-digit PIN
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Rate limit / login error alerts */}
            {rateLimitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-300">Rate Limited</p>
                  <p className="text-[11px] mt-0.5">{rateLimitError}</p>
                </div>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Parent Email */}
            <div className="space-y-1.5">
              <Label htmlFor="parentEmail" className="text-xs font-medium text-zinc-300">
                Parent&apos;s Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  className="pl-9 bg-muted border-border text-white placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11"
                  {...register('parentEmail')}
                />
              </div>
              {errors.parentEmail && (
                <p className="text-[11px] text-red-400 mt-1">{errors.parentEmail.message}</p>
              )}
            </div>

            {/* Student Code */}
            <div className="space-y-1.5">
              <Label htmlFor="studentCode" className="text-xs font-medium text-zinc-300">
                Student Code
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  id="studentCode"
                  type="text"
                  placeholder="e.g. STU-12345"
                  className="pl-9 bg-muted border-border text-white uppercase placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 font-mono"
                  {...register('studentCode')}
                />
              </div>
              {errors.studentCode && (
                <p className="text-[11px] text-red-400 mt-1">{errors.studentCode.message}</p>
              )}
            </div>

            {/* 6-Digit PIN Inputs */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-zinc-300">
                6-Digit Access PIN
              </Label>
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {pinDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    onPaste={handlePinPaste}
                    className="w-11 h-12 text-center text-lg font-bold bg-muted border border-border focus:border-primary focus:ring-2 focus:ring-primary/30 text-primary rounded-xl outline-none transition-all"
                  />
                ))}
              </div>
              {errors.studentPin && (
                <p className="text-[11px] text-red-400 mt-1">{errors.studentPin.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary/80 text-background font-bold py-2.5 h-11 rounded-xl shadow-[0_4px_20px_rgba(212,160,23,0.3)] transition-all duration-200 transform active:scale-[0.98] mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />
                  Entering Classroom...
                </>
              ) : (
                'Access Student Portal'
              )}
            </Button>
          </form>

          {/* Quick link to Parent Login */}
          <div className="mt-6 pt-5 border-t border-border">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#171717] to-card border border-border flex items-center justify-between group hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Are you a Parent or Tutor?</p>
                  <p className="text-[10px] text-zinc-400">Sign in with email and password</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                className="text-xs text-primary hover:text-white hover:bg-primary/20 font-semibold h-8 px-2.5 rounded-lg"
              >
                Sign In →
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