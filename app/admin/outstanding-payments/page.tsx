'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { OutstandingEnrollment, OutstandingPaymentsResponse } from '@/lib/types'
import { AlertTriangle, Clock, Mail, Phone, ArrowLeft, RefreshCw, Calendar } from 'lucide-react'

export default function OutstandingPaymentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<OutstandingPaymentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('daysWaiting:desc')
  const limit = 20

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadData()
  }, [router, page, sort])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await api.getOutstandingPayments({ page, limit, sort })
      setData(response)
    } catch (err) {
      console.error('Failed to load outstanding payments:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load outstanding payments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getDaysWaitingColor = (days: number) => {
    if (days > 7) return 'text-red-500 bg-red-500/10 border-red-500/20'
    if (days > 3) return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    return 'text-green-500 bg-green-500/10 border-green-500/20'
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setPage(1)
  }

  const handleContactParent = (email: string, phone: string) => {
    // Open email client
    window.location.href = `mailto:${email}`
  }

  const handleCallParent = (phone: string) => {
    // Initiate phone call
    window.location.href = `tel:${phone}`
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" className="text-brand-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="gap-2 text-muted-foreground hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">Outstanding Payments</h1>
            <p className="text-sm text-muted-foreground">Enrollments awaiting payment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {data?.total || 0} total outstanding
          </span>
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
      </div>

      {/* Sort Controls */}
      <Card className="bg-card border-brand-gold/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange('daysWaiting:desc')}
                className={sort === 'daysWaiting:desc' ? 'bg-brand-gold/20 border-brand-gold/40 text-brand-gold' : ''}
              >
                Days Waiting (High to Low)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange('daysWaiting:asc')}
                className={sort === 'daysWaiting:asc' ? 'bg-brand-gold/20 border-brand-gold/40 text-brand-gold' : ''}
              >
                Days Waiting (Low to High)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSortChange('createdAt:desc')}
                className={sort === 'createdAt:desc' ? 'bg-brand-gold/20 border-brand-gold/40 text-brand-gold' : ''}
              >
                Date (Newest)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Payments List */}
      {!data || data.data.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Outstanding Payments</h3>
            <p className="text-sm text-muted-foreground">All enrollments have been paid for</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="p-0">
              <div className="divide-y divide-brand-gold/10">
                {data.data.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Student and Subject Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-white">{item.student.fullName}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-brand-gold">{item.subject.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Enrolled: {new Date(item.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Enrollment ID: <code className="text-xs bg-brand-gold/10 text-brand-gold px-1 rounded">{item.enrollmentId ? `${item.enrollmentId.slice(0, 8)}...` : ''}</code></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Parent: {item.parent.fullName || <code className="text-xs bg-brand-gold/10 text-brand-gold px-1 rounded">{item.parent.id.slice(0, 8)}...</code> || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Days Waiting Badge */}
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDaysWaitingColor(item.daysWaiting)}`}>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.daysWaiting} days
                          </div>
                        </div>

                        {/* Payment Status */}
                        <span className="text-xs text-muted-foreground bg-brand-dark/30 px-2 py-1 rounded">
                          {item.paymentStatus}
                        </span>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContactParent(item.parent.email, '')}
                          disabled={!item.parent.email}
                          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>

                    {/* Parent Contact Info (shown on smaller screens) */}
                    <div className="mt-3 pt-3 border-t border-brand-gold/10 lg:hidden">
                      <div className="text-sm text-muted-foreground">
                        <p>Enrollment ID: <code className="text-xs bg-brand-gold/10 text-brand-gold px-1 rounded">{item.enrollmentId ? `${item.enrollmentId.slice(0, 8)}...` : ''}</code></p>
                        <p>Parent: {item.parent.fullName || item.parent.email || 'N/A'}</p>
                        <p>Email: {item.parent.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
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
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({data?.total || 0} total)
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
    </div>
  )
}
