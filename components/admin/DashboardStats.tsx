'use client'

import { useState, useEffect } from 'react'
import { AdminOverview } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Wallet, ClipboardList, Clock, UserCheck, AlertCircle, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/lib/api'
import { AdminPaymentSummary } from '@/lib/types'

interface DashboardStatsProps {
  overview: AdminOverview | null
}

export function DashboardStats({ overview }: DashboardStatsProps) {
  const [paymentSummary, setPaymentSummary] = useState<AdminPaymentSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  useEffect(() => {
    loadPaymentSummary()
  }, [])

  const loadPaymentSummary = async () => {
    setSummaryLoading(true)
    try {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const data = await api.getAdminPaymentSummary({
        from: firstOfMonth.toISOString(),
        to: now.toISOString(),
      })
      setPaymentSummary(data)
    } catch (err) {
      console.error('Failed to load payment summary:', err)
    } finally {
      setSummaryLoading(false)
    }
  }

  if (!overview) return null

  // Calculate simple bar chart heights for revenue by subject
  const maxSubjectRevenue = paymentSummary?.bySubject?.reduce((max, item) => Math.max(max, item.collected), 0) || 0

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards - Reduced to 4 most important */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-brand-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-white">
                {paymentSummary?.totalCollectedNGNEquivalent 
                  ? `₦${paymentSummary.totalCollectedNGNEquivalent.toLocaleString()}`
                  : `$${overview.totalRevenue}`}
              </p>
              <div className="bg-brand-gold/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-brand-gold" />
              </div>
            </div>
            {paymentSummary?.changePercent !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                paymentSummary.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {paymentSummary.changePercent >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {Math.abs(paymentSummary.changePercent).toFixed(1)}% vs last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-brand-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-white">{overview.activeEnrollments}</p>
              <div className="bg-brand-gold/20 p-3 rounded-full">
                <ClipboardList className="h-6 w-6 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-brand-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-white">{overview.totalStudents}</p>
              <div className="bg-brand-gold/20 p-3 rounded-full">
                <GraduationCap className="h-6 w-6 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-brand-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-white">{overview.failedPayments || 0}</p>
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Currency Chart */}
      {paymentSummary && !summaryLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-white">Revenue by Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(paymentSummary.byCurrency).map(([currency, data]) => (
                  <div key={currency} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{currency}</span>
                      <span className="text-white font-medium">
                        {currency === 'NGN' ? '₦' : '$'}{data.collectedTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-brand-dark/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-gold rounded-full transition-all duration-500"
                        style={{ width: `${(data.collectedTotal / (paymentSummary.totalCollectedNGNEquivalent || data.collectedTotal)) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{data.successCount} successful</span>
                      <span>{data.count} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Subject Bar Chart */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-white">Revenue by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentSummary.bySubject && paymentSummary.bySubject.length > 0 ? (
                <div className="space-y-3">
                  {paymentSummary.bySubject.slice(0, 6).map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300 truncate flex-1">{item.subjectName}</span>
                        <span className="text-white font-medium ml-2">
                          ₦{item.collected.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-brand-dark/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-gold rounded-full transition-all duration-500"
                          style={{ width: `${maxSubjectRevenue > 0 ? (item.collected / maxSubjectRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">No revenue data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Status Breakdown */}
      {paymentSummary && !summaryLoading && (
        <Card className="bg-card border-brand-gold/30">
          <CardHeader>
            <CardTitle className="text-white">Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {paymentSummary.byStatus.map((item) => (
                <div key={item.status} className="text-center p-4 bg-brand-dark/30 rounded-lg border border-brand-gold/10">
                  <p className="text-2xl font-bold text-white">{item.count}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {summaryLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
        </div>
      )}
    </div>
  )
}
