'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { AdminPaymentSummary } from '@/lib/types'
import { toNumber } from '@/lib/utils'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Calendar, RefreshCw, ArrowLeft } from 'lucide-react'

export default function AdminPaymentSummaryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [summary, setSummary] = useState<AdminPaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadSummary()
  }, [router, fromDate, toDate, currencyFilter])

  const loadSummary = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (fromDate) filters.from = fromDate
      if (toDate) filters.to = toDate
      if (currencyFilter !== 'ALL') filters.currency = currencyFilter

      const data = await api.getAdminPaymentSummary(filters)
      setSummary(data)
    } catch (err) {
      console.error('Failed to load payment summary:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load payment summary',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetDateRange = (range: '7d' | '30d' | '90d' | 'all') => {
    const now = new Date()
    let from: Date

    switch (range) {
      case '7d':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        setFromDate('')
        setToDate('')
        return
    }

    setFromDate(from.toISOString().split('T')[0])
    setToDate(now.toISOString().split('T')[0])
  }

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
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">Payment Analytics</h1>
            <p className="text-sm text-gray-400">Revenue metrics and payment insights</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSummary}
          disabled={loading}
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Date Range and Currency Filters */}
      <Card className="bg-card border-brand-gold/30">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Date Range:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetDateRange('7d')}
                className={!fromDate && !toDate ? 'bg-brand-gold/20 border-brand-gold/40 text-brand-gold' : ''}
              >
                7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetDateRange('30d')}
                className={fromDate && toDate ? 'bg-brand-gold/20 border-brand-gold/40 text-brand-gold' : ''}
              >
                30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetDateRange('90d')}
                className=""
              >
                90 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetDateRange('all')}
                className=""
              >
                All Time
              </Button>
            </div>
            <div className="flex-1 min-w-0 sm:min-w-64" />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40 bg-brand-dark/30 border-brand-gold/30 text-white"
            />
            <span className="text-gray-400">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40 bg-brand-dark/30 border-brand-gold/30 text-white"
            />
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
          </div>
        </CardContent>
      </Card>

      {summary && (
        <>
          {/* Revenue Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-brand-gold/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-brand-gold" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      ₦{summary.totalCollectedNGNEquivalent.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Total Collected (NGN)</p>
                    {toNumber(summary.changePercent) !== null && (
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        toNumber(summary.changePercent)! >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {toNumber(summary.changePercent)! >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(toNumber(summary.changePercent)!).toFixed(1)}% vs previous period
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {Object.entries(summary.byCurrency).map(([currency, data]) => (
              <Card key={currency} className="bg-card border-brand-gold/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {currency === 'NGN' ? '₦' : '$'}{data.collectedTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{currency} Collected</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {data.successCount} / {data.count} successful ({toNumber(data.successRate) != null ? (toNumber(data.successRate)! * 100).toFixed(1) : 'N/A'}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(summary.byCurrency).map(([currency, data]) => (
              <Card key={`avg-${currency}`} className="bg-card border-brand-gold/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {currency === 'NGN' ? '₦' : '$'}{data.averagePayment.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">Average Payment ({currency})</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue by Subject Chart */}
          {summary.bySubject && summary.bySubject.length > 0 && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Revenue by Subject (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.bySubject.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-white">{item.subjectName}</span>
                          <span className="text-sm text-brand-gold font-medium">
                            ₦{item.collected.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-brand-dark/30 rounded-full h-2">
                          <div
                            className="bg-brand-gold h-2 rounded-full"
                            style={{
                              width: `${(item.collected / summary.bySubject[0].collected) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">
                        {item.count} payments
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payments by Status */}
          {summary.byStatus && summary.byStatus.length > 0 && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Payments by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {summary.byStatus.map((item, index) => (
                    <div key={index} className="p-4 bg-brand-dark/30 rounded-lg border border-brand-gold/10">
                      <p className="text-2xl font-bold text-white">{item.count}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.status}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Revenue Series */}
          {summary.series.dailySeries && summary.series.dailySeries.length > 0 && (
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.series.dailySeries.slice(-14).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 w-24">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 flex gap-2">
                        {Object.entries(item.collected).map(([currency, amount]) => (
                          <div key={currency} className="flex-1">
                            <div className="text-xs text-brand-gold mb-1">
                              {currency === 'NGN' ? '₦' : '$'}{amount.toLocaleString()}
                            </div>
                            <div className="w-full bg-brand-dark/30 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${currency === 'NGN' ? 'bg-brand-gold' : 'bg-blue-500'}`}
                                style={{
                                  width: `${Math.min((amount / Math.max(...(summary.series?.dailySeries || []).map(d => 
                                    Object.values(d.collected).reduce((a, b) => Math.max(a, b), 0)
                                  ))) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
