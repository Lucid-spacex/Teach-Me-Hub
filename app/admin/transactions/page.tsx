'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Modal } from '@/components/shared/Modal'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { PaymentDetail, AdminPaymentSummary, PaymentStatus, OutstandingEnrollment } from '@/lib/types'
import { Search, DollarSign, TrendingUp, Calendar, ChevronRight, ArrowLeft, BarChart3, RefreshCw, StickyNote, CheckCircle, Download, FileText, Filter, Users, Clock, AlertTriangle, MessageSquare } from 'lucide-react'

type TabType = 'overview' | 'all' | 'outstanding' | 'failed'

function AdminTransactionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  // Overview state
  const [summary, setSummary] = useState<AdminPaymentSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [dateRange, setDateRange] = useState('thisMonth')
  const [currency, setCurrency] = useState('ALL')
  
  // All payments state
  const [payments, setPayments] = useState<PaymentDetail[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null)
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL')
  const [providerFilter, setProviderFilter] = useState<string>('ALL')
  const [paymentPage, setPaymentPage] = useState(1)
  const [paymentTotal, setPaymentTotal] = useState(0)
  const paymentLimit = 20
  
  // Outstanding state
  const [outstanding, setOutstanding] = useState<OutstandingEnrollment[]>([])
  const [outstandingLoading, setOutstandingLoading] = useState(true)
  const [outstandingPage, setOutstandingPage] = useState(1)
  const [outstandingTotal, setOutstandingTotal] = useState(0)
  const outstandingLimit = 20
  
  // Failed state
  const [failedPayments, setFailedPayments] = useState<PaymentDetail[]>([])
  const [failedLoading, setFailedLoading] = useState(true)
  const [failedPage, setFailedPage] = useState(1)
  const [failedTotal, setFailedTotal] = useState(0)
  const failedLimit = 20
  
  // Detail drawer state
  const [detailLoading, setDetailLoading] = useState(false)
  
  // Payment note modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  
  // Reverify action state
  const [reverifying, setReverifying] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadSummary()

    // Handle paymentId from notification click
    const paymentIdFromUrl = searchParams.get('paymentId')
    if (paymentIdFromUrl) {
      handleSelectPayment(paymentIdFromUrl)
      // Clear the URL parameter
      router.replace('/admin/transactions', { scroll: false })
    }
  }, [router, dateRange, currency, searchParams])

  useEffect(() => {
    if (activeTab === 'all') {
      loadPayments()
    } else if (activeTab === 'outstanding') {
      loadOutstanding()
    } else if (activeTab === 'failed') {
      loadFailedPayments()
    }
  }, [activeTab, paymentPage, statusFilter, currencyFilter, providerFilter, outstandingPage, failedPage])

  const loadSummary = async () => {
    setSummaryLoading(true)
    try {
      const { from, to } = getDateRange(dateRange)
      const data = await api.getAdminPaymentSummary({
        from,
        to,
        currency: currency !== 'ALL' ? currency : undefined,
      })
      setSummary(data)
    } catch (err) {
      console.error('Failed to load summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  const loadPayments = async () => {
    setPaymentsLoading(true)
    try {
      const data = await api.getTransactions({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        currency: currencyFilter !== 'ALL' ? currencyFilter : undefined,
        provider: providerFilter !== 'ALL' ? providerFilter : undefined,
        page: paymentPage,
        limit: paymentLimit,
      })
      setPayments(data.payments || [])
      setPaymentTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to load transactions:', err)
      setPayments([])
      setPaymentTotal(0)
    } finally {
      setPaymentsLoading(false)
    }
  }

  const loadOutstanding = async () => {
    setOutstandingLoading(true)
    try {
      const data = await api.getOutstandingPayments({
        page: outstandingPage,
        limit: outstandingLimit,
        sort: 'daysWaiting:desc',
      })
      setOutstanding(data.data || [])
      setOutstandingTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to load outstanding payments:', err)
      setOutstanding([])
      setOutstandingTotal(0)
    } finally {
      setOutstandingLoading(false)
    }
  }

  const loadFailedPayments = async () => {
    setFailedLoading(true)
    try {
      const data = await api.getTransactions({
        status: 'FAILED',
        page: failedPage,
        limit: failedLimit,
      })
      setFailedPayments(data.payments || [])
      setFailedTotal(data.total || 0)
    } catch (err) {
      console.error('Failed to load failed payments:', err)
      setFailedPayments([])
      setFailedTotal(0)
    } finally {
      setFailedLoading(false)
    }
  }

  const getDateRange = (range: string) => {
    const now = new Date()
    const from = new Date()
    const to = new Date()

    switch (range) {
      case 'thisMonth':
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setMonth(to.getMonth() + 1)
        to.setDate(0)
        to.setHours(23, 59, 59, 999)
        break
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1)
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setDate(0)
        to.setHours(23, 59, 59, 999)
        break
      case 'last30Days':
        from.setDate(now.getDate() - 30)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'thisYear':
        from.setMonth(0)
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setMonth(11)
        to.setDate(31)
        to.setHours(23, 59, 59, 999)
        break
      default:
        from.setDate(1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
    }

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    }
  }

  const handleDownloadReceiptPDF = async (paymentId: string) => {
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
        description: "Receipt has been downloaded successfully.",
      })
    } catch (err) {
      console.error('Failed to download receipt:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to download receipt",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentPage(1)
    loadPayments()
  }

  const handleSelectPayment = async (paymentId: string) => {
    setDetailLoading(true)
    try {
      const data = await api.getTransactionDetail(paymentId)
      setSelectedPayment(data)
    } catch (err) {
      console.error('Failed to load payment details:', err)
      toast({
        title: 'Error',
        description: 'Failed to load payment details',
        variant: 'destructive',
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!selectedPayment || !noteText.trim()) return

    setSavingNote(true)
    try {
      await api.addPaymentNote(selectedPayment.id, noteText.trim())
      const updated = await api.getTransactionDetail(selectedPayment.id)
      setSelectedPayment(updated)
      setNoteModalOpen(false)
      setNoteText('')
      toast({
        title: 'Note Added',
        description: 'Payment note has been saved successfully.',
      })
    } catch (err) {
      console.error('Failed to add payment note:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add payment note',
        variant: 'destructive',
      })
    } finally {
      setSavingNote(false)
    }
  }

  const handleReverify = async () => {
    if (!selectedPayment) return

    setReverifying(true)
    try {
      const updated = await api.reverifyPayment(selectedPayment.id)
      setSelectedPayment(updated)
      toast({
        title: 'Payment Verified',
        description: 'Payment has been reverified with the payment provider.',
      })
      loadPayments()
      loadFailedPayments()
      loadSummary()
    } catch (err) {
      console.error('Failed to reverify payment:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to reverify payment',
        variant: 'destructive',
      })
    } finally {
      setReverifying(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const blob = await api.exportPaymentsCSV({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        currency: currencyFilter !== 'ALL' ? currencyFilter : undefined,
        provider: providerFilter !== 'ALL' ? providerFilter : undefined,
        search: search || undefined,
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "Export Successful",
        description: "Payments have been exported to CSV.",
      })
    } catch (err) {
      console.error('Failed to export payments:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to export payments",
        variant: "destructive",
      })
    }
  }

  const handleMessageParent = (parentEmail: string) => {
    router.push(`/admin/messages?recipient=${parentEmail}`)
  }

  if (selectedPayment) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPayment(null)}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Transactions
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">Payment Details</h1>
            <p className="text-sm text-gray-400">{selectedPayment.reference}</p>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Reference</p>
                    <p className="font-medium text-white">{selectedPayment.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Receipt #</p>
                    <p className="font-medium text-white">
                      {selectedPayment.receiptNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Provider Reference</p>
                    <p className="font-medium text-white">{selectedPayment.providerReference || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Amount</p>
                    <p className="font-medium text-white">
                      {selectedPayment.currency === 'NGN' ? '₦' : '$'}{selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">NGN Equivalent</p>
                    <p className="font-medium text-white">
                      {selectedPayment.chargedAmountNGN ? `₦${selectedPayment.chargedAmountNGN.toLocaleString()}` : 
                       selectedPayment.ngnEquivalent ? `₦${selectedPayment.ngnEquivalent.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Exchange Rate</p>
                    <p className="font-medium text-white">
                      {selectedPayment.exchangeRateUsed ? `₦${selectedPayment.exchangeRateUsed.toLocaleString()}/$1` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <StatusBadge status={selectedPayment.status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Provider</p>
                    <p className="font-medium text-white">{selectedPayment.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Initiated At</p>
                    <p className="font-medium text-white">
                      {new Date(selectedPayment.initiatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Paid At</p>
                    <p className="font-medium text-white">
                      {selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedPayment.status === 'SUCCESS' && (
                  <div className="pt-4 border-t border-brand-gold/10">
                    <p className="text-sm text-gray-400 mb-3">Download Receipt</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceiptPDF(selectedPayment.id)}
                        className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                )}

                {selectedPayment.failureReason && (
                  <div className="pt-4 border-t border-brand-gold/10">
                    <p className="text-sm text-gray-400 mb-2">Failure Reason</p>
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">
                      {selectedPayment.failureReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPayment.parent && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Parent Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Name</p>
                      <p className="font-medium text-white">{selectedPayment.parent.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium text-white">{selectedPayment.parent.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessageParent(selectedPayment.parent!.email)}
                      className="mt-2 border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Parent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPayment.enrollment && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Enrollment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Student</p>
                      <p className="font-medium text-white">{selectedPayment.enrollment.student.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Subject</p>
                      <p className="font-medium text-white">{selectedPayment.enrollment.subject.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Admin Notes
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNoteModalOpen(true)}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    {selectedPayment.adminNote ? 'Edit Note' : 'Add Note'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedPayment.adminNote ? (
                  <p className="text-sm text-gray-300 bg-brand-dark/40 p-3 rounded border border-brand-gold/10">
                    {selectedPayment.adminNote}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No admin notes added yet.</p>
                )}
              </CardContent>
            </Card>

            {selectedPayment.status === 'PENDING' && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-500/20 p-2 rounded-lg">
                        <RefreshCw className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Reverify Payment</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Manually verify this payment with the payment provider. Use this if the webhook failed to arrive.
                        </p>
                        <Button
                          size="sm"
                          onClick={handleReverify}
                          disabled={reverifying}
                          className="mt-3 bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                        >
                          {reverifying ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reverify with Provider
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPayment.timeline && Array.isArray(selectedPayment.timeline) && selectedPayment.timeline.length > 0 && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Payment Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPayment.timeline.map((event: any, index: number) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-brand-gold mt-2" />
                          {index < (selectedPayment.timeline?.length || 0) - 1 && (
                            <div className="w-px h-full bg-border min-h-[2rem]" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm text-white">{event.status || event.event}</p>
                          <p className="text-xs text-gray-400">{new Date(event.timestamp || event.createdAt).toLocaleString()}</p>
                          {event.message && (
                            <p className="text-xs text-gray-400 mt-1">{event.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPayment.auditLogs && Array.isArray(selectedPayment.auditLogs) && selectedPayment.auditLogs.length > 0 && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedPayment.auditLogs.map((log: any, index: number) => (
                      <div key={index} className="p-3 bg-brand-dark/30 rounded border border-brand-gold/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-white">{log.action}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Admin ID: {log.adminId} • {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-brand-gold cursor-pointer">View Details</summary>
                            <pre className="text-xs text-gray-400 mt-2 bg-brand-dark/50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Transactions</h1>
          <p className="text-sm text-gray-400">View and manage all payment transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-gold/20 pb-4">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'bg-brand-gold text-brand-dark' : 'text-gray-300 hover:text-white'}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('all')}
          className={activeTab === 'all' ? 'bg-brand-gold text-brand-dark' : 'text-gray-300 hover:text-white'}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          All Payments
        </Button>
        <Button
          variant={activeTab === 'outstanding' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('outstanding')}
          className={activeTab === 'outstanding' ? 'bg-brand-gold text-brand-dark' : 'text-gray-300 hover:text-white'}
        >
          <Clock className="h-4 w-4 mr-2" />
          Outstanding
        </Button>
        <Button
          variant={activeTab === 'failed' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('failed')}
          className={activeTab === 'failed' ? 'bg-brand-gold text-brand-dark' : 'text-gray-300 hover:text-white'}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Failed
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {summaryLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" className="text-brand-gold" />
            </div>
          ) : summary ? (
            <>
              {/* Date Range and Currency Filters */}
              <div className="flex gap-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48 bg-brand-dark/30 border-brand-gold/30 text-white">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="last30Days">Last 30 Days</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-32 bg-brand-dark/30 border-brand-gold/30 text-white">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Currencies</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-brand-gold/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-brand-gold" />
                      <div>
                        <p className="text-2xl font-bold text-white">
                          ₦{summary.totalCollectedNGNEquivalent.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Total Collected (NGN)</p>
                        {summary.changePercent !== undefined && (
                          <p className={`text-xs mt-1 ${summary.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.changePercent >= 0 ? '+' : ''}{summary.changePercent.toFixed(1)}% vs previous
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {summary.byCurrency.NGN && (
                  <Card className="bg-card border-brand-gold/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-brand-gold" />
                        <div>
                          <p className="text-2xl font-bold text-white">
                            ₦{summary.byCurrency.NGN.collectedTotal.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">NGN Collected</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {summary.byCurrency.NGN.successCount} / {summary.byCurrency.NGN.count} successful
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {summary.byCurrency.USD && (
                  <Card className="bg-card border-brand-gold/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-brand-gold" />
                        <div>
                          <p className="text-2xl font-bold text-white">
                            ${summary.byCurrency.USD.collectedTotal.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">USD Collected</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {summary.byCurrency.USD.successCount} / {summary.byCurrency.USD.count} successful
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card className="bg-card border-brand-gold/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-brand-gold" />
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {Object.values(summary.byCurrency).reduce((acc, curr) => acc + curr.successRate, 0) / 
                           Object.keys(summary.byCurrency).length * 100 || 0
                          }%
                        </p>
                        <p className="text-xs text-gray-400">Overall Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card border-brand-gold/30">
                  <CardHeader>
                    <CardTitle className="text-white">Revenue by Subject</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.bySubject.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-white">{item.subjectName}</span>
                          <span className="text-sm text-brand-gold font-medium">
                            ₦{item.collected.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-brand-gold/30">
                  <CardHeader>
                    <CardTitle className="text-white">Payments by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.byStatus.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-white">{item.status}</span>
                          <span className="text-sm text-brand-gold font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="bg-card border-brand-gold/30 text-center py-16">
              <CardContent>
                <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">No Summary Data</h3>
                <p className="text-sm text-gray-400">Select a date range to view revenue analytics</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* All Payments Tab */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by reference, receipt #, parent name, or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-brand-dark/30 border-brand-gold/30 text-white placeholder:text-gray-500"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-brand-dark/30 border-brand-gold/30 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger className="w-32 bg-brand-dark/30 border-brand-gold/30 text-white">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Currencies</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger className="w-32 bg-brand-dark/30 border-brand-gold/30 text-white">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Providers</SelectItem>
                    <SelectItem value="PAYSTACK">Paystack</SelectItem>
                    <SelectItem value="STRIPE">Stripe</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportCSV}
                  className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </form>
            </CardContent>
          </Card>

          {paymentsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" className="text-brand-gold" />
            </div>
          ) : payments.length === 0 ? (
            <Card className="bg-card border-brand-gold/30 text-center py-16">
              <CardContent>
                <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">No Transactions Found</h3>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-card border-brand-gold/30">
                <CardContent className="p-0">
                  <div className="divide-y divide-brand-gold/10">
                    {payments.map((payment) => (
                      <button
                        key={payment.id}
                        onClick={() => handleSelectPayment(payment.id)}
                        className="w-full text-left p-4 hover:bg-brand-gold/5 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-brand-gold/20 text-brand-gold">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{payment.reference}</p>
                            {payment.receiptNumber && (
                              <p className="text-xs text-brand-gold font-medium">{payment.receiptNumber}</p>
                            )}
                            <p className="text-sm text-gray-400">
                              {payment.parent ? payment.parent.fullName : 'N/A'}
                              {payment.enrollment && ` • ${payment.enrollment.student.fullName} • ${payment.enrollment.subject.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {payment.currency === 'NGN' ? '₦' : '$'}{payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(payment.initiatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusBadge status={payment.status} />
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {Math.ceil(paymentTotal / paymentLimit) > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                    disabled={paymentPage === 1}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-400">
                    Page {paymentPage} of {Math.ceil(paymentTotal / paymentLimit)} ({paymentTotal} total)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentPage(p => Math.min(Math.ceil(paymentTotal / paymentLimit), p + 1))}
                    disabled={paymentPage === Math.ceil(paymentTotal / paymentLimit)}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Outstanding Tab */}
      {activeTab === 'outstanding' && (
        <div className="space-y-6">
          {outstandingLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" className="text-brand-gold" />
            </div>
          ) : outstanding.length === 0 ? (
            <Card className="bg-card border-brand-gold/30 text-center py-16">
              <CardContent>
                <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">No Outstanding Payments</h3>
                <p className="text-sm text-gray-400">All enrollments have been paid for</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-card border-brand-gold/30">
                <CardContent className="p-0">
                  <div className="divide-y divide-brand-gold/10">
                    {outstanding.map((item) => (
                      <div
                        key={item.enrollmentGroupId}
                        className="p-4 hover:bg-brand-gold/5 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-white">{item.parent.name}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400">{item.parent.email}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400">{item.parent.phone}</span>
                            </div>
                            <div className="text-sm text-gray-400 mb-2">
                              Student: {item.student.fullName} • Subjects: {item.subjects.join(', ')}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-white font-medium">
                                {item.expectedCurrency === 'NGN' ? '₦' : '$'}{item.expectedAmount.toLocaleString()}
                              </span>
                              <span className={`text-sm px-2 py-1 rounded ${
                                item.daysWaiting > 7 ? 'bg-red-500/20 text-red-400' :
                                item.daysWaiting > 3 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {item.daysWaiting} days waiting
                              </span>
                              {item.latestPaymentStatus && (
                                <span className="text-sm text-gray-400">
                                  Last: {item.latestPaymentStatus}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMessageParent(item.parent.email)}
                            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 ml-4"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message Parent
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {Math.ceil(outstandingTotal / outstandingLimit) > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOutstandingPage(p => Math.max(1, p - 1))}
                    disabled={outstandingPage === 1}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-400">
                    Page {outstandingPage} of {Math.ceil(outstandingTotal / outstandingLimit)} ({outstandingTotal} total)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOutstandingPage(p => Math.min(Math.ceil(outstandingTotal / outstandingLimit), p + 1))}
                    disabled={outstandingPage === Math.ceil(outstandingTotal / outstandingLimit)}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Failed Tab */}
      {activeTab === 'failed' && (
        <div className="space-y-6">
          {failedLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" className="text-brand-gold" />
            </div>
          ) : failedPayments.length === 0 ? (
            <Card className="bg-card border-brand-gold/30 text-center py-16">
              <CardContent>
                <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-1">No Failed Payments</h3>
                <p className="text-sm text-gray-400">All payments are successful or pending</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="bg-card border-brand-gold/30">
                <CardContent className="p-0">
                  <div className="divide-y divide-brand-gold/10">
                    {failedPayments.map((payment) => (
                      <button
                        key={payment.id}
                        onClick={() => handleSelectPayment(payment.id)}
                        className="w-full text-left p-4 hover:bg-brand-gold/5 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-red-500/20 text-red-400">
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{payment.reference}</p>
                            <p className="text-sm text-gray-400">
                              {payment.parent ? payment.parent.fullName : 'N/A'}
                              {payment.enrollment && ` • ${payment.enrollment.student.fullName}`}
                            </p>
                            {payment.failureReason && (
                              <p className="text-xs text-red-400 mt-1">{payment.failureReason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-white">
                              {payment.currency === 'NGN' ? '₦' : '$'}{payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(payment.initiatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <StatusBadge status={payment.status} />
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {Math.ceil(failedTotal / failedLimit) > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFailedPage(p => Math.max(1, p - 1))}
                    disabled={failedPage === 1}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-400">
                    Page {failedPage} of {Math.ceil(failedTotal / failedLimit)} ({failedTotal} total)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFailedPage(p => Math.min(Math.ceil(failedTotal / failedLimit), p + 1))}
                    disabled={failedPage === Math.ceil(failedTotal / failedLimit)}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Note Modal */}
      <Modal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} title="Admin Note">
        <div className="space-y-4">
          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add internal notes about this payment..."
              rows={4}
              className="mt-1.5 bg-brand-dark/30 border-brand-gold/30 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setNoteModalOpen(false)}
              disabled={savingNote}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={savingNote || !noteText.trim()}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {savingNote ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function AdminTransactionsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" className="text-brand-gold" /></div>}>
      <AdminTransactionsContent />
    </Suspense>
  )
}
