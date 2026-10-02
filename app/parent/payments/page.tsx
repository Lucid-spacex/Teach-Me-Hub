'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { api } from '@/lib/api'
import { Payment, Enrollment, Student } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CreditCard, ChevronDown, ChevronUp, AlertCircle, ArrowLeft, RefreshCw, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { openPaystackCheckout } from '@/lib/paystack'

export default function PaymentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const user = getUser()
      if (!user || getUserRole() !== 'PARENT') {
        router.push('/login')
        return
      }

      loadData()
    } catch (err) {
      console.error('Error in payments page useEffect:', err)
      setLoading(false)
    }
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [paymentsData, enrollmentsData, studentsData] = await Promise.all([
        api.getPayments().catch(() => []),
        api.getEnrollments().catch(() => []),
        api.getStudents().catch(() => []),
      ])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setStudents(Array.isArray(studentsData) ? studentsData : [])
      
      const pending = Array.isArray(enrollmentsData) 
        ? enrollmentsData.filter(e => e.status === 'PENDING_PAYMENT')
        : []
      setPendingEnrollments(pending)
    } catch (err) {
      console.error('Failed to load payments data:', err)
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayEnrollment = async (enrollment: Enrollment) => {
    setPayingId(enrollment.id)
    try {
      // If this enrollment belongs to a group, pay by group (covers all subjects
      // enrolled together). Otherwise pay by individual enrollmentId.
      // Backend resolves the price — never send amount. Currency is required by Paystack.
      const currency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || 'NGN'
      const paymentData = enrollment.enrollmentGroupId
        ? { enrollmentGroupId: enrollment.enrollmentGroupId, currency }
        : { enrollmentId: enrollment.id, currency }

      const response = await api.initiatePayment(paymentData)

      if (response.success && (response.accessCode || response.authorizationUrl)) {
        await openPaystackCheckout({
          accessCode: response.accessCode,
          authorizationUrl: response.authorizationUrl,
          reference: response.reference,
          onSuccess: (ref) => {
            window.location.href = `/payment/callback?reference=${encodeURIComponent(ref)}`
          },
          onCancel: () => {
            toast({
              title: "Payment Cancelled",
              description: "You closed the payment popup. You can complete payment at any time.",
            })
          },
        })
      } else {
        throw new Error(response.message || 'Failed to initiate payment')
      }
    } catch (err) {
      toast({
        title: "Payment Error",
        description: err instanceof Error ? err.message : "Failed to initiate payment",
        variant: "destructive",
      })
    } finally {
      setPayingId(null)
    }
  }

  const toggleExpand = (paymentId: string) => {
    setExpandedPaymentId(expandedPaymentId === paymentId ? null : paymentId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return currency === 'NGN' 
      ? `₦${amount.toLocaleString()}` 
      : `$${amount.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'text-green-400'
      case 'PENDING':
        return 'text-yellow-400'
      case 'FAILED':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.fullName || 'Student'
  }

  const columns = [
    {
      key: 'id',
      header: 'Payment ID',
      cell: (payment: Payment) => (
        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">
          {(payment.providerReference || payment.reference || payment.id).slice(0, 12)}...
        </code>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment: Payment) => (
        <div className="text-white font-medium">
          {formatAmount(payment.amount, payment.currency || 'NGN')}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment: Payment) => (
        <span className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
          {payment.status}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (payment: Payment) => (
        <div className="text-gray-300">{formatDate(payment.createdAt)}</div>
      ),
    },
    {
      key: 'expand',
      header: '',
      cell: (payment: Payment) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleExpand(payment.id)}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          {expandedPaymentId === payment.id ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/parent')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Payments & Billing</h1>
              <p className="text-sm text-gray-400">View payment history and pay for pending enrollments</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Pending Payments Section */}
        {pendingEnrollments.length > 0 && (
          <Card className="bg-amber-950/20 border-brand-gold/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-brand-gold flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Payments ({pendingEnrollments.length})
              </CardTitle>
              <CardDescription className="text-gray-300">
                You have active enrollments awaiting payment to confirm schedules and tutor matching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-brand-dark/80 border border-brand-gold/20"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">
                        {getStudentName(enrollment.studentId)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-brand-gold font-medium">
                        {enrollment.subject?.name || 'Tutoring Subject'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {enrollment.sessionFrequency} • Starts {new Date(enrollment.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handlePayEnrollment(enrollment)}
                    disabled={payingId === enrollment.id}
                    className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold shrink-0"
                  >
                    {payingId === enrollment.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now with Paystack
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Payment History Card */}
        <Card className="bg-card border-brand-gold/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-gold" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={payments}
              columns={columns}
              loading={loading}
              emptyState={{
                icon: CreditCard,
                title: "No payments yet",
                description: "Your past successful and pending transactions will appear here",
              }}
            />
            
            {expandedPaymentId && (
              <div className="mt-4 p-4 bg-brand-dark/50 border border-brand-gold/30 rounded-lg">
                {(() => {
                  const payment = payments.find(p => p.id === expandedPaymentId)
                  if (!payment) return null
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Payment ID / Ref:</span>
                        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">
                          {payment.providerReference || payment.reference || payment.id}
                        </code>
                      </div>
                      
                      {payment.enrollmentGroupId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Enrollment Group ID:</span>
                          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{payment.enrollmentGroupId}</code>
                        </div>
                      )}
                      
                      {payment.enrollmentId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Enrollment ID:</span>
                          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{payment.enrollmentId}</code>
                        </div>
                      )}
                      
                      {payment.subjects && payment.subjects.length > 0 && (
                        <div className="pt-2 border-t border-gray-700">
                          <span className="text-sm text-gray-400 block mb-2">Covers:</span>
                          <div className="flex flex-wrap gap-2">
                            {payment.subjects.map((subject, index) => (
                              <span
                                key={index}
                                className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-1 rounded"
                              >
                                {subject.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-sm text-gray-400">Amount:</span>
                        <span className="text-white font-bold">
                          {formatAmount(payment.amount, payment.currency || 'NGN')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Status:</span>
                        <span className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Date:</span>
                        <span className="text-white">{formatDate(payment.createdAt)}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}