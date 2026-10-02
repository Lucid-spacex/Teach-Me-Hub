'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { CreateEnrollmentRequest, Student, Subject, SessionFrequency, BillingFrequency } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, AlertCircle, DollarSign } from 'lucide-react'
import { openPaystackCheckout } from '@/lib/paystack'

interface EnrollStudentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: Student[]
  onSuccess: () => void
}

const SESSION_FREQUENCIES: { value: SessionFrequency; label: string; requiredDays: number }[] = [
  { value: 'TWICE_WEEKLY', label: 'Twice Weekly', requiredDays: 2 },
  { value: 'THRICE_WEEKLY', label: 'Three Times Weekly', requiredDays: 3 },
  { value: 'FIVE_TIMES_WEEKLY', label: 'Five Times Weekly', requiredDays: 5 },
]

const BILLING_FREQUENCIES: { value: BillingFrequency; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
]

const DAYS_OF_WEEK = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' },
  { value: 'SUN', label: 'Sunday' },
]

export function EnrollStudentModal({ open, onOpenChange, students, onSuccess }: EnrollStudentModalProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 'payment'>(1)
  const [formData, setFormData] = useState<CreateEnrollmentRequest>({
    studentId: '',
    subjectIds: [],
    sessionFrequency: 'TWICE_WEEKLY',
    availableDays: [],
    preferredStartHour: 9,
    preferredEndHour: 10,
    billingFrequency: 'MONTHLY',
    startDate: '',
  })
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [enrollmentGroupId, setEnrollmentGroupId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [userTimezone, setUserTimezone] = useState<string>('UTC')
  const [pricingTiers, setPricingTiers] = useState<any[]>([])
  const [pricingLoading, setPricingLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadSubjects()
      loadPricingTiers()
      loadUserTimezone()
    }
  }, [open])

  const loadSubjects = async () => {
    setSubjectsLoading(true)
    try {
      const data = await api.getSubjects()
      setSubjects(data)
    } catch (err) {
      console.error('Failed to load subjects:', err)
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      })
    } finally {
      setSubjectsLoading(false)
    }
  }

  const loadPricingTiers = async () => {
    setPricingLoading(true)
    try {
      // Try to get pricing from a public endpoint if available
      // If that fails, we'll rely on the backend to provide pricing during enrollment creation
      const data = await api.getPricingTiers()
      setPricingTiers(data)
    } catch (err) {
      console.error('Failed to load pricing tiers (expected for non-admin users):', err)
      // This is expected for non-admin users - pricing will be calculated by backend
    } finally {
      setPricingLoading(false)
    }
  }

  const loadUserTimezone = async () => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setUserTimezone(user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
      } else {
        setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
      }
    } catch (err) {
      setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
  }

  const getNigeriaTimePreview = (hour: number): string => {
    try {
      const now = new Date()
      const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0)
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        hour: 'numeric',
        hour12: true,
      })
      
      const nigeriaFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Lagos',
        hour: 'numeric',
        hour12: true,
      })
      
      const localTime = formatter.format(localDate)
      const nigeriaTime = nigeriaFormatter.format(localDate)
      
      return `${localTime} → ${nigeriaTime}`
    } catch (err) {
      return `${hour}:00 → ${hour}:00 Nigeria time`
    }
  }

  const calculateTotalPrice = (): { ngn: number; usd: number; hasPricing: boolean } => {
    let totalNGN = 0
    let totalUSD = 0
    let hasPricing = false

    formData.subjectIds.forEach(subjectId => {
      const subject = subjects.find(s => s.id === subjectId)
      if (subject) {
        // First try to use subject's own pricing if available
        if (subject.priceNGN && subject.priceUSD) {
          totalNGN += subject.priceNGN
          totalUSD += subject.priceUSD
          hasPricing = true
        } else {
          // Fall back to pricing tiers based on grade band
          const pricingTier = pricingTiers.find(tier => tier.gradeBandTier === subject.gradeBand)
          if (pricingTier) {
            totalNGN += pricingTier.priceNGN
            totalUSD += pricingTier.priceUSD
            hasPricing = true
          }
        }
      }
    })

    return { ngn: totalNGN, usd: totalUSD, hasPricing }
  }

  const getDayCountValidation = (): { valid: boolean; message: string } => {
    const frequency = SESSION_FREQUENCIES.find(f => f.value === formData.sessionFrequency)
    if (!frequency) return { valid: false, message: 'Invalid frequency' }
    
    if (formData.availableDays.length !== frequency.requiredDays) {
      return {
        valid: false,
        message: `Please select exactly ${frequency.requiredDays} day${frequency.requiredDays > 1 ? 's' : ''} for ${frequency.label}`
      }
    }
    
    return { valid: true, message: '' }
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      console.log('Creating enrollment with data:', formData)
      
      const response = await api.createEnrollment(formData)
      
      console.log('Enrollment creation response:', response)
      
      setEnrollmentGroupId(response.enrollmentGroupId)
      setStep('payment')
      toast({
        title: "Enrollments Created",
        description: "Please complete payment to activate",
      })
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create enrollment'
      console.error('Enrollment creation error:', err)
      
      // Provide specific guidance for different error types
      if (error.includes('No pricing configured') || error.includes('pricing')) {
        toast({
          title: "Pricing Configuration Error",
          description: "The pricing tiers for these subjects are not yet configured. Please try enrolling in a single subject first, or contact the administrator.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      }

      if (error.includes('Validation failed')) {
        if (error.includes('studentId')) setErrors(prev => ({ ...prev, studentId: 'Please select a student' }))
        if (error.includes('subjectIds')) setErrors(prev => ({ ...prev, subjectIds: 'Please select at least 1 subject' }))
        if (error.includes('sessionFrequency')) setErrors(prev => ({ ...prev, sessionFrequency: 'Invalid frequency' }))
        if (error.includes('availableDays')) setErrors(prev => ({ ...prev, availableDays: 'Invalid day selection' }))
        if (error.includes('startDate')) setErrors(prev => ({ ...prev, startDate: 'Invalid start date' }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollmentGroupId) {
      toast({
        title: "Error",
        description: "Enrollment group not found",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log('Initiating payment with:', { enrollmentGroupId, currency })
      
      // Send group identifier + currency — backend calculates amount from enrollment records.
      // Currency is required by Paystack; NEVER send amount (backend resolves it).
      const response = await api.initiatePayment({
        enrollmentGroupId,
        currency,
      })

      console.log('Payment initiation response:', response)

      if (response.success && (response.accessCode || response.authorizationUrl)) {
        await openPaystackCheckout({
          accessCode: response.accessCode,
          authorizationUrl: response.authorizationUrl,
          reference: response.reference,
          onSuccess: (ref) => {
            window.location.href = `/payment/callback?reference=${encodeURIComponent(ref)}`
          },
          onCancel: () => {
            setLoading(false)
            toast({
              title: "Payment Cancelled",
              description: "You can pay anytime from your Enrollments or Payments page.",
            })
          },
        })
      } else {
        console.error('Payment initiation failed:', response)
        throw new Error(response.message || 'Failed to initiate payment')
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to process payment'
      console.error('Payment submission error:', err)
      
      // Provide specific guidance for different error types
      if (error.includes('No pricing configured') || error.includes('pricing')) {
        toast({
          title: "Pricing Configuration Error",
          description: "The pricing tiers for these subjects are not yet configured. Please contact the administrator to set up pricing, or try enrolling in a single subject first.",
          variant: "destructive",
        })
      } else if (error.includes('Invalid payment URL') || error.includes('authorizationUrl')) {
        toast({
          title: "Payment Gateway Error",
          description: "The payment gateway returned an invalid URL. This may be a temporary issue. Please try again or contact support if the problem persists.",
          variant: "destructive",
        })
      } else if (error.includes('Payment service not configured') || error.includes('Paystack is not configured')) {
        toast({
          title: "Payment Service Error",
          description: "The payment service is not properly configured. Please contact the administrator.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Payment Error",
          description: error,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setFormData({
      studentId: '',
      subjectIds: [],
      sessionFrequency: 'TWICE_WEEKLY',
      availableDays: [],
      preferredStartHour: 9,
      preferredEndHour: 10,
      billingFrequency: 'MONTHLY',
      startDate: '',
    })
    setCurrency('NGN')
    setEnrollmentGroupId(null)
    setErrors({})
    onOpenChange(false)
  }

  const nextStep = () => {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else if (step === 3) setStep(4)
  }

  const prevStep = () => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
  }

  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.studentId && formData.subjectIds.length >= 1 && formData.subjectIds.length <= 4)
      case 2:
        const dayValidation = getDayCountValidation()
        return dayValidation.valid
      case 3:
        return formData.preferredStartHour < formData.preferredEndHour
      case 4:
        return Boolean(formData.billingFrequency && formData.startDate)
      default:
        return false
    }
  }

  if (students.length === 0) {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title="Enroll Student"
        description="You need to add a student first before creating an enrollment"
        footer={
          <Button onClick={() => onOpenChange(false)} className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark">Close</Button>
        }
      >
        <div className="text-center py-4">
          <p className="text-gray-400">Please add a student to your account first</p>
        </div>
      </Modal>
    )
  }

  const totalPrice = calculateTotalPrice()

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title={step === 'payment' ? 'Complete Payment' : `Enroll Student - Step ${step}/4`}
      description={step === 'payment' ? 'Initiate payment for the enrollments' : 'Create a new enrollment for your child'}
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={step === 'payment' ? () => setStep(4) : handleClose}
            disabled={loading}
            className="border-brand-gold text-brand-gold hover:bg-brand-gold/10"
          >
            {step === 'payment' ? 'Back' : 'Cancel'}
          </Button>
          {step === 'payment' ? (
            <Button
              type="submit"
              form="payment-form"
              disabled={loading}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Initiate Payment
            </Button>
          ) : (
            <>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={loading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={step === 4 ? handleEnrollSubmit : nextStep}
                disabled={loading || !isStepValid()}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
              >
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {step === 4 ? 'Create Enrollments' : 'Next'}
              </Button>
            </>
          )}
        </div>
      }
    >
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student" className="text-gray-300">Student *</Label>
            <Select
              value={formData.studentId}
              onValueChange={(value) => setFormData({ ...formData, studentId: value })}
            >
              <SelectTrigger className={`bg-background border-input ${errors.studentId ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && <p className="text-sm text-destructive">{errors.studentId}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Select Subjects (1-4) *</Label>
            {subjectsLoading ? (
              <div className="text-sm text-gray-400">Loading subjects...</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={formData.subjectIds.includes(subject.id)}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true
                        if (isChecked && formData.subjectIds.length >= 4) {
                          toast({
                            title: "Maximum subjects reached",
                            description: "You can select up to 4 subjects",
                            variant: "destructive",
                          })
                          return
                        }
                        setFormData({
                          ...formData,
                          subjectIds: isChecked
                            ? [...formData.subjectIds, subject.id]
                            : formData.subjectIds.filter(id => id !== subject.id)
                        })
                      }}
                    />
                    <label
                      htmlFor={`subject-${subject.id}`}
                      className="text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      {subject.name} ({subject.gradeBand})
                      {subject.priceNGN && (
                        <span className="ml-2 text-xs text-brand-gold">
                          ₦{subject.priceNGN.toLocaleString()} / ${subject.priceUSD?.toLocaleString()}
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
            {errors.subjectIds && <p className="text-sm text-destructive">{errors.subjectIds}</p>}
          </div>

          {formData.subjectIds.length > 0 && (
            <>
              <Card className="bg-brand-gold/10 border-brand-gold/30">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-white mb-2">Total Price</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">NGN:</span>
                      <span className="text-brand-gold font-bold">₦{totalPrice.ngn.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">USD:</span>
                      <span className="text-brand-gold font-bold">${totalPrice.usd.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {!totalPrice.hasPricing && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Pricing will be calculated by the server based on your selected subjects and billing frequency. You'll see the exact amount during payment.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionFrequency" className="text-gray-300">Session Frequency *</Label>
            <Select
              value={formData.sessionFrequency}
              onValueChange={(value) => {
                setFormData({ ...formData, sessionFrequency: value as SessionFrequency, availableDays: [] })
              }}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SESSION_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label} ({freq.requiredDays} days/week)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Available Days *</Label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.availableDays.includes(day.value)}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true
                      setFormData({
                        ...formData,
                        availableDays: isChecked
                          ? [...formData.availableDays, day.value]
                          : formData.availableDays.filter(d => d !== day.value)
                      })
                    }}
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className="text-xs text-gray-300 cursor-pointer"
                  >
                    {day.label.slice(0, 3)}
                  </label>
                </div>
              ))}
            </div>
            {!getDayCountValidation().valid && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{getDayCountValidation().message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preferredStartHour" className="text-gray-300">From Hour *</Label>
              <Select
                value={formData.preferredStartHour.toString()}
                onValueChange={(value) => setFormData({ ...formData, preferredStartHour: parseInt(value) })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredEndHour" className="text-gray-300">To Hour *</Label>
              <Select
                value={formData.preferredEndHour.toString()}
                onValueChange={(value) => setFormData({ ...formData, preferredEndHour: parseInt(value) })}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, '0')}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-brand-dark/50 border border-brand-gold/30 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">
              Pick the time in your own local time — we'll convert it to Nigeria time for your tutor.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-brand-gold" />
              <span className="text-gray-300">
                This is approximately {getNigeriaTimePreview(formData.preferredStartHour)} – {getNigeriaTimePreview(formData.preferredEndHour)} Nigeria time
              </span>
            </div>
          </div>

          {formData.preferredStartHour >= formData.preferredEndHour && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>End hour must be after start hour</span>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingFrequency" className="text-gray-300">Billing Frequency *</Label>
            <Select
              value={formData.billingFrequency}
              onValueChange={(value) => setFormData({ ...formData, billingFrequency: value as BillingFrequency })}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BILLING_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-gray-300">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={`bg-background border-input ${errors.startDate ? 'border-destructive' : ''}`}
            />
            {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
          </div>

          <Card className="bg-brand-gold/10 border-brand-gold/30">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-white mb-2">Enrollment Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Student:</span>
                  <span className="text-white">{students.find(s => s.id === formData.studentId)?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subjects:</span>
                  <span className="text-white">
                    {formData.subjectIds.map(id => subjects.find(s => s.id === id)?.name).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequency:</span>
                  <span className="text-white">
                    {SESSION_FREQUENCIES.find(f => f.value === formData.sessionFrequency)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Days:</span>
                  <span className="text-white">
                    {formData.availableDays.map(day => {
                      const dayObj = DAYS_OF_WEEK.find(d => d.value === day)
                      return dayObj ? dayObj.label : day
                    }).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">
                    {formData.preferredStartHour}:00 - {formData.preferredEndHour}:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Billing:</span>
                  <span className="text-white">
                    {BILLING_FREQUENCIES.find(f => f.value === formData.billingFrequency)?.label}
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total (NGN):</span>
                    <span className="text-brand-gold font-bold">₦{totalPrice.ngn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total (USD):</span>
                    <span className="text-brand-gold font-bold">${totalPrice.usd.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!totalPrice.hasPricing && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Pricing will be calculated by the server based on your selected subjects and billing frequency. You'll see the exact amount during payment.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'payment' && (
        <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-4">
          <Card className="bg-brand-dark/50 border-brand-gold/30">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-white mb-4">Enrollment Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Student:</span>
                  <span className="text-white">{students.find(s => s.id === formData.studentId)?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subjects:</span>
                  <span className="text-white">
                    {formData.subjectIds.map(id => subjects.find(s => s.id === id)?.name).join(', ')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 border-brand-gold/50">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-brand-gold" />
                Payment Amount
              </p>
              {totalPrice.hasPricing ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-brand-dark/50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400">Nigerian Naira</p>
                      <p className="text-2xl font-bold text-brand-gold">₦{totalPrice.ngn.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">US Dollar</p>
                      <p className="text-2xl font-bold text-brand-gold">${totalPrice.usd.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    You can pay in either currency below
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-brand-dark/50 rounded-lg">
                    <p className="text-sm text-gray-300">
                      The exact payment amount will be calculated by the server based on your selected subjects, session frequency, and billing period.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      You'll see the final amount on the payment page before completing your transaction.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-gray-300">Select Payment Currency *</Label>
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as 'NGN' | 'USD')}
            >
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">
                  Nigerian Naira (NGN){totalPrice.hasPricing ? ` - ₦${totalPrice.ngn.toLocaleString()}` : ''}
                </SelectItem>
                <SelectItem value="USD">
                  US Dollar (USD){totalPrice.hasPricing ? ` - $${totalPrice.usd.toLocaleString()}` : ''}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-brand-gold/10 border border-brand-gold/30 p-4 rounded-lg">
            <p className="text-sm text-gray-300">
              You will be redirected to the payment gateway to complete the transaction.
            </p>
          </div>
        </form>
      )}
    </Modal>
  )
}
