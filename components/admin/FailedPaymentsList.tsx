'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Payment } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { AlertCircle, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function FailedPaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      const data = await api.getFailedPayments()
      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load failed payments:', err)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'id',
      header: 'Payment ID',
      cell: (payment: Payment) => (
        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{payment.id}</code>
      ),
    },
    {
      key: 'enrollmentId',
      header: 'Enrollment ID',
      cell: (payment: Payment) => (
        <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{payment.enrollmentId}</code>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment: Payment) => (
        <div className="text-gray-300">${payment.amount}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment: Payment) => (
        <span className="text-sm font-medium text-destructive">{payment.status}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (payment: Payment) => (
        <div className="text-gray-300">{new Date(payment.createdAt).toLocaleDateString()}</div>
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
