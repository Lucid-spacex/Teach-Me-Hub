'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { User, Mail, Phone, Lock, CheckCircle2, ArrowLeft, ArrowRight, ShieldCheck, GraduationCap, MapPin, Eye, EyeOff, BookOpen, Briefcase } from 'lucide-react'
import { api } from '@/lib/api'
import { RegisterRequest, Subject, HighestQualification, TutorLevel, HowHeardSource } from '@/lib/types'
import { QUALIFICATIONS, LEVELS, HEARD_ABOUT, SUBJECT_CATEGORIES } from '@/lib/tutorApplicationOptions'

type Step = 'account' | 'about' | 'teaching' | 'review'

const STEPS: { key: Step; label: string }[] = [
  { key: 'account', label: 'Account' },
  { key: 'about', label: 'About You' },
  { key: 'teaching', label: 'Teaching' },
  { key: 'review', label: 'Review' },
]

const ABOUT_YOU_MAX = 60
const ABOUT_YOU_COUNT = 3

interface ApplicationFormState {
  birthDate: string // YYYY-MM-DD from date picker; split into birthDay/birthMonth on submit
  country: string
  city: string
  highestQualification?: HighestQualification
  subjects: string[]
  levels: TutorLevel[]
  yearsOfExperience: number
  expectedMonthlySalaryNGN: number
  whyTeach: string
  howHeard?: HowHeardSource
  aboutYou: string[]
}

const emptyApplication: ApplicationFormState = {
  birthDate: '',
  country: '',
  city: '',
  highestQualification: undefined,
  subjects: [],
  levels: [],
  yearsOfExperience: 0,
  expectedMonthlySalaryNGN: 50000,
  whyTeach: '',
  howHeard: undefined,
  aboutYou: ['', '', ''],
}

export default function TutorRegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('account')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    password: '',
    role: 'TUTOR',
    address: '',
  })

  const [appData, setAppData] = useState<ApplicationFormState>(emptyApplication)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getPublicSubjects().then(setSubjects).catch(() => setSubjects([]))
  }, [])

  const setApp = <K extends keyof ApplicationFormState>(key: K, value: ApplicationFormState[K]) => {
    setAppData(prev => ({ ...prev, [key]: value }))
  }

  const setAboutYouAt = (index: number, value: string) => {
    setAppData(prev => {
      const next = [...prev.aboutYou]
      next[index] = value
      return { ...prev, aboutYou: next }
    })
  }

  const toggleInArray = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter(v => v !== value) : [...list, value]

  const filledAboutYou = () => appData.aboutYou.map(s => s.trim()).filter(Boolean)

  const validateStep = (s: Step): string | null => {
    if (s === 'account') {
      if (!formData.firstName.trim() || !formData.lastName.trim()) return 'First and last name are required'
      if (!formData.email.trim()) return 'Email is required'
      if (!formData.phone.trim() || formData.phone.trim().length < 10) return 'A valid phone number is required'
      if (!formData.address || formData.address.trim().length < 5) return 'Address is required (min 5 characters)'
      if (formData.password.length < 8) return 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(formData.password)) return 'Password must contain an uppercase letter'
      if (!/[a-z]/.test(formData.password)) return 'Password must contain a lowercase letter'
      if (!/[0-9]/.test(formData.password)) return 'Password must contain a number'
      if (!/[^A-Za-z0-9]/.test(formData.password)) return 'Password must contain a special character'
      return null
    }
    if (s === 'about') {
      if (!appData.birthDate) return 'Please select your birthday'
      const [y, m, d] = appData.birthDate.split('-').map(Number)
      if (!y || !m || m < 1 || m > 12 || !d || d < 1 || d > 31) return 'Please select a valid birthday'
      if (!appData.country.trim()) return 'Country is required'
      if (!appData.city.trim()) return 'City is required'
      if (!appData.highestQualification) return 'Please select your highest qualification'
      return null
    }
    if (s === 'teaching') {
      if (appData.subjects.length === 0) return 'Please select at least one subject'
      if (appData.levels.length === 0) return 'Please select at least one level'
      if (appData.yearsOfExperience < 0) return 'Years of experience cannot be negative'
      if (appData.expectedMonthlySalaryNGN < 10000 || appData.expectedMonthlySalaryNGN > 5000000) return 'Expected monthly salary must be between ₦10,000 and ₦5,000,000'
      if (appData.whyTeach.trim().length < 10) return 'Please tell us why you want to teach (min 10 characters)'
      if (!appData.howHeard) return 'Please select how you heard about us'
      const aboutYou = filledAboutYou()
      if (aboutYou.length === 0) return 'Please fill in at least one "about you" paragraph'
      if (aboutYou.length > ABOUT_YOU_COUNT) return `"About you" allows up to ${ABOUT_YOU_COUNT} paragraphs`
      if (aboutYou.some(p => p.length > ABOUT_YOU_MAX)) return `Each "about you" paragraph must be ${ABOUT_YOU_MAX} characters or fewer`
      return null
    }
    return null
  }

  const goNext = () => {
    const msg = validateStep(step)
    if (msg) {
      setError(msg)
      toast({ title: 'Missing Information', description: msg, variant: 'destructive' })
      return
    }
    setError('')
    const idx = STEPS.findIndex(s => s.key === step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key)
  }

  const goBack = () => {
    setError('')
    const idx = STEPS.findIndex(s => s.key === step)
    if (idx > 0) setStep(STEPS[idx - 1].key)
  }

  const buildRegisterPayload = (): RegisterRequest => {
    const [, birthMonth, birthDay] = appData.birthDate.split('-').map(Number)
    return {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      middleName: formData.middleName?.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address?.trim(),
      // Application fields — sent in the same register request per spec
      birthDay,
      birthMonth,
      country: appData.country.trim(),
      city: appData.city.trim(),
      highestQualification: appData.highestQualification,
      subjects: appData.subjects,
      levels: appData.levels,
      yearsOfExperience: appData.yearsOfExperience,
      expectedMonthlySalaryNGN: appData.expectedMonthlySalaryNGN,
      whyTeach: appData.whyTeach.trim(),
      howHeard: appData.howHeard,
      aboutYou: filledAboutYou(),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const msg = validateStep('account') || validateStep('about') || validateStep('teaching')
    if (msg) {
      setError(msg)
      toast({ title: 'Incomplete', description: msg, variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const response = await api.register(buildRegisterPayload())

      if (response.emailSent === false) {
        toast({
          title: 'Email Not Sent',
          description: 'Verification email could not be sent. Please click "Resend OTP" on the next page.',
          variant: 'destructive',
        })
      }

      sessionStorage.setItem('pendingVerificationEmail', formData.email)
      setSuccess(true)
      toast({
        title: 'Registration Successful',
        description: 'Please check your email for the verification OTP.',
      })
      router.push('/verify')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'

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

  const groupedSubjects = (() => {
    const grouped: Record<string, Subject[]> = { CORE: [], ENRICHMENT: [], TEST_PREP: [] }
    subjects.forEach(s => {
      if (grouped[s.category]) grouped[s.category].push(s)
    })
    return grouped
  })()

  const birthDisplay = appData.birthDate
    ? new Date(appData.birthDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : ''

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
                  Your tutor account and application have been submitted. Verify your email to complete registration.
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

  const stepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div className="w-full max-w-lg mx-auto relative z-10 space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
          <BrandHeader />
        </div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          Tutor Registration
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
              i === stepIndex ? 'bg-primary text-black' : i < stepIndex ? 'bg-primary/30 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:inline ${i === stepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card className="bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(212,160,23,0.08)] rounded-2xl overflow-hidden">
        <div className="h-1 bg-primary opacity-80" />

        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            {step === 'account' && <><ShieldCheck className="w-5 h-5 text-primary" /> Create Your Account</>}
            {step === 'about' && <><User className="w-5 h-5 text-primary" /> About You</>}
            {step === 'teaching' && <><BookOpen className="w-5 h-5 text-primary" /> Your Teaching</>}
            {step === 'review' && <><Briefcase className="w-5 h-5 text-primary" /> Review &amp; Submit</>}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs mt-1">
            {step === 'account' && 'Your login credentials and contact details.'}
            {step === 'about' && 'Tell us about yourself — this becomes part of your tutor application.'}
            {step === 'teaching' && 'Your subjects, levels and experience — reviewed by our team.'}
            {step === 'review' && 'Check everything before submitting your application.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'account' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">First Name *</Label>
                    <Input id="firstName" required value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Sarah"
                      className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">Last Name *</Label>
                    <Input id="lastName" required value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Jenkins"
                      className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="middleName" className="text-xs font-medium text-muted-foreground">Middle Name (Optional)</Label>
                  <Input id="middleName" value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    placeholder="Optional"
                    className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" required value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 pl-10" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" type="tel" required value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234 XXX XXX XXXX"
                        className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 pl-10" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" required value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Your full address"
                      className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 pl-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} required value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="8+ chars, upper, lower, number, special"
                      className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11 pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 'about' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-xs font-medium text-muted-foreground">Birthday *</Label>
                  <Input id="birthDate" type="date" required value={appData.birthDate}
                    onChange={(e) => setApp('birthDate', e.target.value)}
                    className="bg-muted border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                  <p className="text-xs text-muted-foreground">Day and month are used for your profile</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Country *</Label>
                    <Input value={appData.country} onChange={(e) => setApp('country', e.target.value)}
                      placeholder="Your country"
                      className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">City *</Label>
                    <Input value={appData.city} onChange={(e) => setApp('city', e.target.value)}
                      placeholder="Your city"
                      className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Highest Qualification *</Label>
                  <Select value={appData.highestQualification} onValueChange={(v) => setApp('highestQualification', v as HighestQualification)}>
                    <SelectTrigger className="bg-muted border-border rounded-xl h-11">
                      <SelectValue placeholder="Select your qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATIONS.map(q => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 'teaching' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Subjects You Can Teach *</Label>
                  {Object.entries(groupedSubjects).map(([category, catSubjects]) => (
                    catSubjects.length > 0 && (
                      <div key={category} className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">{SUBJECT_CATEGORIES[category as keyof typeof SUBJECT_CATEGORIES]}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {catSubjects.map(subject => (
                            <button key={subject.id} type="button"
                              onClick={() => setApp('subjects', toggleInArray(appData.subjects, subject.id))}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                appData.subjects.includes(subject.id)
                                  ? 'bg-primary text-black'
                                  : 'bg-muted text-muted-foreground hover:text-foreground'
                              }`}>
                              {subject.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  {subjects.length === 0 && (
                    <p className="text-xs text-muted-foreground">Loading subjects...</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Levels You Can Teach *</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS.map(level => (
                      <button key={level.value} type="button"
                        onClick={() => setApp('levels', toggleInArray(appData.levels, level.value))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          appData.levels.includes(level.value)
                            ? 'bg-primary text-black'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}>
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Years of Experience *</Label>
                    <Input type="number" min="0" value={appData.yearsOfExperience}
                      onChange={(e) => setApp('yearsOfExperience', parseInt(e.target.value) || 0)}
                      className="bg-muted border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Expected Monthly Salary (NGN) *</Label>
                    <Input type="number" min="10000" max="5000000" step="1000" value={appData.expectedMonthlySalaryNGN}
                      onChange={(e) => setApp('expectedMonthlySalaryNGN', parseInt(e.target.value) || 50000)}
                      className="bg-muted border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-11" />
                    <p className="text-[10px] text-muted-foreground">Between ₦10,000 and ₦5,000,000</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">How Did You Hear About Us? *</Label>
                  <Select value={appData.howHeard} onValueChange={(v) => setApp('howHeard', v as HowHeardSource)}>
                    <SelectTrigger className="bg-muted border-border rounded-xl h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {HEARD_ABOUT.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Why Do You Want to Teach? *</Label>
                  <Textarea value={appData.whyTeach} onChange={(e) => setApp('whyTeach', e.target.value)}
                    placeholder="Tell us what motivates you to teach..." rows={3}
                    className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">A Little About You *</Label>
                  <p className="text-xs text-muted-foreground">Up to {ABOUT_YOU_COUNT} short paragraphs, {ABOUT_YOU_MAX} characters each</p>
                  {appData.aboutYou.map((paragraph, i) => (
                    <div key={i} className="space-y-1">
                      <Textarea value={paragraph} maxLength={ABOUT_YOU_MAX}
                        onChange={(e) => setAboutYouAt(i, e.target.value)}
                        placeholder={`Paragraph ${i + 1} (optional${i === 0 ? ' — at least one required' : ''})`}
                        rows={2}
                        className="bg-muted border-border text-foreground placeholder:text-zinc-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl" />
                      <p className="text-xs text-muted-foreground text-right">{paragraph.length}/{ABOUT_YOU_MAX}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {formData.firstName} {formData.middleName} {formData.lastName}</p>
                  <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                  <p><span className="text-muted-foreground">Phone:</span> {formData.phone}</p>
                  <p><span className="text-muted-foreground">Birthday:</span> {birthDisplay}</p>
                  <p><span className="text-muted-foreground">Location:</span> {appData.city}, {appData.country}</p>
                  <p><span className="text-muted-foreground">Qualification:</span> {QUALIFICATIONS.find(q => q.value === appData.highestQualification)?.label}</p>
                  <p><span className="text-muted-foreground">Subjects:</span> {appData.subjects.length} selected</p>
                  <p><span className="text-muted-foreground">Levels:</span> {appData.levels.map(l => LEVELS.find(lev => lev.value === l)?.label).join(', ')}</p>
                  <p><span className="text-muted-foreground">Experience:</span> {appData.yearsOfExperience} years</p>
                  <p><span className="text-muted-foreground">Expected Monthly Salary:</span> ₦{appData.expectedMonthlySalaryNGN.toLocaleString()}</p>
                  <p><span className="text-muted-foreground">About You:</span> {filledAboutYou().length} paragraph(s)</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitting sends your account and application together. After email verification, your application goes to our review team — you&apos;ll be notified once it&apos;s approved.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              {stepIndex > 0 ? (
                <Button type="button" variant="outline" onClick={goBack}
                  className="rounded-xl h-11 border-border text-foreground hover:bg-muted">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step === 'review' ? (
                <Button type="submit" disabled={loading}
                  className="flex-1 bg-primary text-black font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" className="text-black" />
                      <span>Submitting Application...</span>
                    </div>
                  ) : 'Submit Application'}
                </Button>
              ) : (
                <Button type="button" onClick={goNext}
                  className="flex-1 bg-primary text-black font-semibold rounded-xl h-11 hover:opacity-90 transition-opacity">
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </form>

          <div className="pt-4 border-t border-zinc-800">
            <Link href="/register" className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-3 w-3" />
              Back to Parent Registration
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
