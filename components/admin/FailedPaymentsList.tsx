'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { FailedPayment } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { AlertCircle, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FailedPaymentsListProps {
  refreshTrigger?: number
}

export function FailedPaymentsList({ refreshTrigger }: FailedPaymentsListProps) {
  const [payments, setPayments] = useState<FailedPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [refreshTrigger])

  const loadPayments = async () => {
    try {
      const response = await api.getFailedPayments()
      setPayments(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Failed to load failed payments:', err)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'receiptNumber',
      header: 'Receipt #',
      cell: (payment: FailedPayment) => (
        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{payment.receiptNumber}</code>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      cell: (payment: FailedPayment) => (
        <div>
          <div className="font-medium text-white">{payment.parent.fullName}</div>
          <div className="text-xs text-gray-400">{payment.parent.email}</div>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Student',
      cell: (payment: FailedPayment) => (
        <div>
          <div className="font-medium text-white">{payment.student.fullName}</div>
          <div className="text-xs text-gray-400">{payment.student.gradeLevel}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment: FailedPayment) => (
        <div className="text-gray-300">{payment.currency === 'NGN' ? '₦' : '$'}{payment.amount.toLocaleString()}</div>
      ),
    },
    {
      key: 'failureReason',
      header: 'Reason',
      cell: (payment: FailedPayment) => (
        <div className="text-sm text-red-400">{payment.failureReason}</div>
      ),
    },
    {
      key: 'date',
      header: 'Failed At',
      cell: (payment: FailedPayment) => (
        <div className="text-gray-300">{payment.failedAt ? new Date(payment.failedAt).toLocaleDateString() : 'N/A'}</div>
      ),
    },
  ]

  return (
    <Card className="bg-card border-brand-gold/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-brand-gold" />
          Failed Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={payments}
          columns={columns}
          loading={loading}
          emptyState={{
            icon: AlertCircle,
            title: "No failed payments",
            description: "Failed payment attempts will appear here",
          }}
        />
      </CardContent>
    </Card>
  )
}
