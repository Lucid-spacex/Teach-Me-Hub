'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { api } from '@/lib/api'
import { Payment, Enrollment, Student } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CreditCard, ChevronDown, ChevronUp, AlertCircle, ArrowLeft, RefreshCw, Loader2, CheckCircle, Download, FileText, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { openPaystackCheckout } from '@/lib/paystack'

function PaymentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [paymentDetail, setPaymentDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [paymentSummary, setPaymentSummary] = useState<{ totalPaidPerCurrency: { USD: number; NGN: number } } | null>(null)
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null)

  useEffect(() => {
    try {
      const user = getUser()
      if (!user || getUserRole() !== 'PARENT') {
        router.push('/login')
        return
      }

      loadData()

      // Handle paymentId from notification click
      const paymentIdFromUrl = searchParams.get('paymentId')
      if (paymentIdFromUrl) {
        toggleExpand(paymentIdFromUrl)
        // Clear the URL parameter
        router.replace('/parent/payments', { scroll: false })
      }
    } catch (err) {
      console.error('Error in payments page useEffect:', err)
      setLoading(false)
    }
  }, [router, page, statusFilter, searchParams])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }

      const [paymentsResponse, enrollmentsData, studentsData] = await Promise.all([
        api.getPayments(params.toString()).catch(() => []),
        api.getEnrollments().catch(() => []),
        api.getStudents().catch(() => []),
      ])

      // Handle both paginated and non-paginated responses
      let paymentsData: Payment[] = []
      let totalCount = 0
      let summary = null

      if (Array.isArray(paymentsResponse)) {
        paymentsData = paymentsResponse
        totalCount = paymentsData.length
      } else if (paymentsResponse && typeof paymentsResponse === 'object' && 'data' in paymentsResponse) {
        paymentsData = paymentsResponse.data || []
        totalCount = paymentsResponse.total || 0
        summary = (paymentsResponse as any).summary || null
      }

      setPayments(paymentsData)
      setTotal(totalCount)
      setPaymentSummary(summary)
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

  const toggleExpand = async (paymentId: string) => {
    if (expandedPaymentId === paymentId) {
      setExpandedPaymentId(null)
      setSelectedPayment(null)
      setPaymentDetail(null)
    } else {
      setExpandedPaymentId(paymentId)
      const payment = payments.find(p => p.id === paymentId)
      setSelectedPayment(payment || null)

      // Load payment detail with timeline
      if (payment) {
        setLoadingDetail(true)
        try {
          const detail = await api.getPaymentDetail(payment.id)
          setPaymentDetail(detail)
        } catch (err) {
          console.error('Failed to load payment detail:', err)
          toast({
            title: "Error",
            description: "Failed to load payment details",
            variant: "destructive",
          })
        } finally {
          setLoadingDetail(false)
        }
      }
    }
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
      case 'PENDING':
        return 'text-amber-500'
      case 'SUCCESS':
        return 'text-green-500'
      case 'FAILED':
        return 'text-red-500'
      case 'EXPIRED':
        return 'text-muted-foreground'
      case 'REFUNDED':
        return 'text-brand-gold'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.fullName || 'Student'
  }

  const handleDownloadReceiptPDF = async (paymentId: string) => {
    setDownloadingReceipt(paymentId)
    try {
      const blob = await api.downloadPaymentReceiptPDF(paymentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "Receipt Downloaded",
        description: "Your receipt has been downloaded successfully.",
      })
    } catch (err) {
      console.error('Failed to download receipt:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to download receipt",
        variant: "destructive",
      })
    } finally {
      setDownloadingReceipt(null)
    }
  }

  const handleViewReceiptJSON = async (paymentId: string) => {
    try {
      const receipt = await api.getPaymentReceipt(paymentId)
      // Display receipt in a modal or new tab
      const receiptWindow = window.open('', '_blank')
      if (receiptWindow) {
        receiptWindow.document.write(`
          <html>
            <head><title>Receipt - ${receipt.receiptNumber}</title></head>
            <body>
              <pre>${JSON.stringify(receipt, null, 2)}</pre>
            </body>
          </html>
        `)
      }
    } catch (err) {
      console.error('Failed to view receipt:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to view receipt",
        variant: "destructive",
      })
    }
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      cell: (payment: Payment) => (
        <div className="text-muted-foreground">{formatDate(payment.createdAt)}</div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      cell: (payment: Payment) => {
        const studentName = payment.studentId ? getStudentName(payment.studentId) : 'N/A'
        return <div className="text-foreground">{studentName}</div>
      },
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (payment: Payment) => {
        const subjectName = payment.subjects && payment.subjects.length > 0
          ? payment.subjects[0].name
          : payment.subject?.name || 'N/A'
        return <div className="text-foreground">{subjectName}</div>
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment: Payment) => (
        <div className="text-foreground font-medium">
          {formatAmount(payment.amount, payment.currency || 'NGN')}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment: Payment) => (
        <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(payment.status)}`}>
          {payment.status}
        </span>
      ),
    },
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      cell: (payment: Payment) => {
        // receiptNumber is only present for SUCCESS payments
        const receiptNumber = (payment as any).receiptNumber
        if (payment.status === 'SUCCESS' && receiptNumber) {
          return (
            <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">
              {receiptNumber}
            </code>
          )
        }
        return <span className="text-xs text-muted-foreground">N/A</span>
      },
    },
    {
      key: 'reference',
      header: 'Reference',
      cell: (payment: Payment) => (
        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">
          {(payment.providerReference || payment.reference || payment.id).slice(0, 12)}...
        </code>
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
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
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
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Payments & Billing</h1>
              <p className="text-sm text-muted-foreground">View payment history and pay for pending enrollments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="bg-background border border-input text-foreground px-3 py-2 rounded-md text-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="EXPIRED">Expired</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Pending Payments Section */}
        {pendingEnrollments.length > 0 && (
          <Card className="bg-primary/10 border-primary/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-brand-gold flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Payments ({pendingEnrollments.length})
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                You have active enrollments awaiting payment to confirm schedules and tutor matching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted border border-brand-gold/20"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {getStudentName(enrollment.studentId)}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-brand-gold font-medium">
                        {enrollment.subject?.name || 'Tutoring Subject'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {enrollment.sessionFrequency} • Starts {new Date(enrollment.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handlePayEnrollment(enrollment)}
                    disabled={payingId === enrollment.id}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0"
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

        {/* Payment Summary Card */}
        {paymentSummary && (
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand-gold" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Paid (NGN)</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    ₦{(paymentSummary?.totalPaidPerCurrency?.NGN || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Paid (USD)</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    ${(paymentSummary?.totalPaidPerCurrency?.USD || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History Card */}
        <Card className="bg-card border-brand-gold/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
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
              <div className="mt-4 p-4 bg-muted border border-brand-gold/30 rounded-xl">
                {loadingDetail ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
                  </div>
                ) : paymentDetail ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Payment ID / Ref:</span>
                        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">
                          {paymentDetail.providerReference || paymentDetail.reference || paymentDetail.id}
                        </code>
                      </div>

                      {paymentDetail.enrollmentGroupId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Enrollment Group ID:</span>
                          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{paymentDetail.enrollmentGroupId}</code>
                        </div>
                      )}

                      {paymentDetail.enrollmentId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Enrollment ID:</span>
                          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{paymentDetail.enrollmentId}</code>
                        </div>
                      )}

                      {paymentDetail.subjects && paymentDetail.subjects.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <span className="text-sm text-muted-foreground block mb-2">Covers:</span>
                          <div className="flex flex-wrap gap-2">
                            {paymentDetail.subjects.map((subject: any, index: number) => (
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

                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Amount:</span>
                        <span className="text-foreground font-bold">
                          {formatAmount(paymentDetail.amount, paymentDetail.currency || 'NGN')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span className={`text-sm font-medium ${getStatusColor(paymentDetail.status)}`}>
                          {paymentDetail.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="text-foreground">{formatDate(paymentDetail.createdAt)}</span>
                      </div>

                      {/* Receipt Number */}
                      {paymentDetail.receiptNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Receipt #:</span>
                          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">
                            {paymentDetail.receiptNumber}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Receipt Download Buttons - Only for SUCCESS payments */}
                    {paymentDetail.status === 'SUCCESS' && (
                      <div className="pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground block mb-3">Download Receipt</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceiptPDF(paymentDetail.id)}
                            disabled={downloadingReceipt === paymentDetail.id}
                            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                          >
                            {downloadingReceipt === paymentDetail.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceiptJSON(paymentDetail.id)}
                            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View JSON
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {paymentDetail.timeline && Array.isArray(paymentDetail.timeline) && paymentDetail.timeline.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground block mb-3">Timeline</span>
                        <div className="space-y-3">
                          {paymentDetail.timeline.map((event: any, index: number) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-brand-gold mt-2" />
                                {index < paymentDetail.timeline.length - 1 && (
                                  <div className="w-px h-full bg-border min-h-[2rem]" />
                                )}
                              </div>
                              <div className="flex-1 pb-2">
                                <p className="text-sm text-foreground">{event.status || event.event}</p>
                                <p className="text-xs text-muted-foreground">{new Date(event.timestamp || event.createdAt).toLocaleString()}</p>
                                {event.message && (
                                  <p className="text-xs text-muted-foreground mt-1">{event.message}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedPayment ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Payment ID / Ref:</span>
                      <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">
                        {(selectedPayment.providerReference || selectedPayment.reference || selectedPayment.id).slice(0, 20)}...
                      </code>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="text-foreground font-bold">
                        {formatAmount(selectedPayment.amount, selectedPayment.currency || 'NGN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={`text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-foreground">{formatDate(selectedPayment.createdAt)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} payments
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" className="text-brand-gold" /></div>}>
      <PaymentsContent />
    </Suspense>
  )
}
