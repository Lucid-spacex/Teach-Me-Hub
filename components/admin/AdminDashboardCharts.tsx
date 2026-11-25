'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, GraduationCap, AlertCircle, CreditCard, Wallet } from 'lucide-react'
import { api } from '@/lib/api'
import { AdminPaymentSummary, AdminOverview } from '@/lib/types'
import { toNumber } from '@/lib/utils'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AdminDashboardChartsProps {
  overview: AdminOverview | null
}

const COLORS = ['#FFD700', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B']

export function AdminDashboardCharts({ overview }: AdminDashboardChartsProps) {
  const [paymentSummary, setPaymentSummary] = useState<AdminPaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadPaymentSummary()
  }, [timeRange])

  const loadPaymentSummary = async () => {
    setLoading(true)
    try {
      const now = new Date()
      let fromDate: Date

      if (timeRange === '7d') {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timeRange === '30d') {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      }

      console.log('Fetching payment summary with date range:', {
        from: fromDate.toISOString(),
        to: now.toISOString(),
        timeRange
      })

      const data = await api.getAdminPaymentSummary({
        from: fromDate.toISOString(),
        to: now.toISOString(),
      })
      console.log('Payment summary data received:', JSON.stringify(data, null, 2))
      console.log('Daily series length:', data.dailySeries?.length)
      console.log('By subject length:', data.bySubject?.length)
      console.log('By status length:', data.byStatus?.length)
      console.log('ByCurrency keys:', Object.keys(data.byCurrency || {}))
      setPaymentSummary(data)
    } catch (err) {
      console.error('Failed to load payment summary:', err)
      // Set empty summary data structure instead of null to prevent errors
      setPaymentSummary({
        byCurrency: {},
        totalCollectedNGNEquivalent: 0,
        changePercent: 0,
        series: { dailySeries: [] },
        dailySeries: [],
        bySubject: [],
        byStatus: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (!overview) return null

  const totalRevenue = paymentSummary?.totalCollectedNGNEquivalent || overview.totalRevenue || 0
  const totalStudents = overview.totalStudents || 0
  const totalUsers = overview.totalUsers || 0
  const failedPayments = overview.failedPayments || 0
  const activeEnrollments = overview.activeEnrollments || 0

  const currencyData = paymentSummary?.byCurrency
    ? Object.entries(paymentSummary.byCurrency).map(([currency, data]) => ({
        name: currency,
        collected: data.collectedTotal || 0,
        pending: data.pendingTotal || 0,
        failed: data.failedTotal || 0,
        count: data.count || 0,
      }))
    : []

  const subjectData = paymentSummary?.bySubject || []
  const statusData = paymentSummary?.byStatus || []

  const dailyRevenueData = paymentSummary?.series?.dailySeries?.map(item => {
    if (!item || !item.date) return null
    return {
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...(item.collected || {}),
    }
  }).filter(Boolean) || []

  const pieData = currencyData.map(item => ({
    name: item.name,
    value: item.collected,
  }))

  const totalCollected = currencyData.reduce((sum, item) => sum + (item.collected || 0), 0)
  const totalPending = currencyData.reduce((sum, item) => sum + (item.pending || 0), 0)
  const totalFailed = currencyData.reduce((sum, item) => sum + (item.failed || 0), 0)

  const balanceData = [
    { name: 'Collected', value: totalCollected, color: '#10B981' },
    { name: 'Pending', value: totalPending, color: '#F59E0B' },
    { name: 'Failed', value: totalFailed, color: '#EF4444' },
  ]

  const cumulativeRevenue = dailyRevenueData.reduce((acc, curr, index) => {
    if (!curr) return acc
    const prevTotal = index > 0 && acc[index - 1] ? acc[index - 1].cumulative : 0
    const currentTotal = Object.entries(curr)
      .filter(([key]) => key !== 'date')
      .reduce((sum: number, [, val]) => sum + (typeof val === 'number' ? val : 0), 0)
    return [...acc, { date: curr.date, cumulative: prevTotal + currentTotal }]
  }, [] as Array<{ date: string; cumulative: number }>)

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border-brand-gold/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">
                {toNumber(totalRevenue) != null && toNumber(totalRevenue)! >= 1000 ? `₦${(toNumber(totalRevenue)! / 1000).toFixed(1)}K` : `₦${totalRevenue}`}
              </p>
              <div className="bg-brand-gold/20 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-brand-gold" />
              </div>
            </div>
            {paymentSummary && toNumber(paymentSummary.changePercent) !== null && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                toNumber(paymentSummary.changePercent)! >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className="h-4 w-4" />
                {Math.abs(toNumber(paymentSummary.changePercent)!).toFixed(1)}% vs last period
              </div>
            )}
            {!paymentSummary && (
              <p className="text-xs text-muted-foreground mt-2">No payment data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{totalStudents}</p>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active learners</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{activeEnrollments}</p>
              <div className="bg-green-500/20 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Course enrollments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{failedPayments}</p>
              <div className="bg-red-500/20 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Time Range:</span>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-brand-gold text-brand-dark font-medium'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brand-gold" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
            </div>
          ) : dailyRevenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {Object.keys(dailyRevenueData[0] || {}).filter(key => key !== 'date').map((currency, index) => (
                  <Line
                    key={currency}
                    type="monotone"
                    dataKey={currency}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: COLORS[index % COLORS.length] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
              <p>No revenue data available for this period</p>
              <p className="text-xs">The payment summary API may not be implemented or no payments exist</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Currency and Subject */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-gold" />
              Revenue by Currency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${toNumber(percent) != null ? (toNumber(percent)! * 100).toFixed(0) : 'N/A'}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                <p>No currency data available</p>
                <p className="text-xs">No payments have been made yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-gold" />
              Revenue by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
              </div>
            ) : subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="subjectName" className="text-xs" angle={-45} textAnchor="end" height={100} />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => typeof value === 'number' ? `₦${value.toLocaleString()}` : '₦0'}
                  />
                  <Bar dataKey="collected" fill="#FFD700" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                <p>No subject data available</p>
                <p className="text-xs">No payments have been made yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Breakdown */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand-gold" />
            Payment Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
            </div>
          ) : statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="status" type="category" className="text-xs" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#FFD700" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
              <p>No status data available</p>
              <p className="text-xs">No payments have been made yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-brand-gold" />
              Balance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
              </div>
            ) : balanceData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={balanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => `${name}: ₦${value.toLocaleString()} (${toNumber(percent) != null ? (toNumber(percent)! * 100).toFixed(0) : 'N/A'}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {balanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => typeof value === 'number' ? `₦${value.toLocaleString()}` : '₦0'}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                <p>No balance data available</p>
                <p className="text-xs">No payments have been made yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-gold" />
              Cumulative Money In
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
              </div>
            ) : cumulativeRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cumulativeRevenue}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => toNumber(value) != null ? `₦${(toNumber(value)! / 1000).toFixed(0)}K` : '₦0'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => typeof value === 'number' ? `₦${value.toLocaleString()}` : '₦0'}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#FFD700" fillOpacity={1} fill="url(#colorCumulative)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                <p>No cumulative data available</p>
                <p className="text-xs">No payments have been made yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
