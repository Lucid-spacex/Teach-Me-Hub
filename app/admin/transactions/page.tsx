'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { PaymentDetail, PaymentSummary, PaymentStatus, PaymentProvider } from '@/lib/types'
import { Search, DollarSign, TrendingUp, Calendar, ChevronRight, ArrowLeft, BarChart3, RefreshCw, StickyNote, CheckCircle } from 'lucide-react'

export default function AdminTransactionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [payments, setPayments] = useState<PaymentDetail[]>([])
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null)
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL')
  const [providerFilter, setProviderFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

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

    loadPayments()
    loadSummary()
  }, [router, page, statusFilter, currencyFilter, providerFilter])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await api.getTransactions({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        currency: currencyFilter !== 'ALL' ? currencyFilter : undefined,
        provider: providerFilter !== 'ALL' ? providerFilter : undefined,
        page,
        limit,
      })
      console.log('Transactions data:', data)
      setPayments(Array.isArray(data?.payments) ? data.payments : [])
      setTotal(data?.total || 0)
    } catch (err) {
      console.error('Failed to load transactions:', err)
      setPayments([])
      setTotal(0)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load transactions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const data = await api.getTransactionSummary()
      setSummary(data)
    } catch (err) {
      console.error('Failed to load summary:', err)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
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
      // Refresh payment details to get the updated note
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
      // Refresh the list to update status
      loadPayments()
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

  const totalPages = Math.ceil(total / limit)

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
            {/* Payment Info */}
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
                      {selectedPayment.ngnEquivalent ? `₦${selectedPayment.ngnEquivalent.toLocaleString()}` : 'N/A'}
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
              </CardContent>
            </Card>

            {/* Enrollment Info */}
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

            {/* Admin Note */}
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

            {/* Admin Actions */}
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
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Transactions</h1>
          <p className="text-sm text-gray-400">View and manage all payment transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-brand-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">₦{summary.totalRevenueNGN.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Total Revenue (NGN)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-brand-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">${summary.totalRevenueUSD.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">USD value shown to parents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-brand-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">{summary.totalCount}</p>
                  <p className="text-xs text-gray-400">Total Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-brand-gold" />
                <div>
                  <p className="text-2xl font-bold text-white">{(summary.successRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="bg-card border-brand-gold/30">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by reference, parent name, or email..."
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
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment List */}
      {loading ? (
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
                        <p className="text-sm text-gray-400">
                          {payment.enrollment ? `${payment.enrollment.student.fullName} • ${payment.enrollment.subject.name}` : 'N/A'}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages} ({total} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
              >
                Next
              </Button>
            </div>
          )}
        </>
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
