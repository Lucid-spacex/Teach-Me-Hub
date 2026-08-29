'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Payment } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { AlertCircle } from 'lucide-react'

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
        <code className="text-xs bg-muted px-2 py-1 rounded">{payment.id}</code>
      ),
    },
    {
      key: 'enrollmentId',
      header: 'Enrollment ID',
      cell: (payment: Payment) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{payment.enrollmentId}</code>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (payment: Payment) => `$${payment.amount}`,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (payment: Payment) => (
        <span className="text-sm font-medium">{payment.status}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (payment: Payment) => new Date(payment.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Failed Payments</h2>
        <p className="text-xs text-muted-foreground">
          Note: Only failed payments are visible. A general payments endpoint would show all statuses.
        </p>
      </div>

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
    </div>
  )
}
