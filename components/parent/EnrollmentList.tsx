'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Enrollment, Student } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { GraduationCap, Layers, CreditCard, Loader2 } from 'lucide-react'
import { openPaystackCheckout } from '@/lib/paystack'
import { useToast } from '@/components/ui/use-toast'

interface EnrollmentListProps {
  students: Student[]
  onEnrollStudent: () => void
  refreshTrigger?: number
}

interface EnrollmentGroup {
  groupId: string | null
  enrollments: Enrollment[]
  createdAt: string
}

export function EnrollmentList({ students, onEnrollStudent, refreshTrigger }: EnrollmentListProps) {
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    loadEnrollments()
  }, [refreshTrigger])

  const loadEnrollments = async () => {
    try {
      const data = await api.getEnrollments()
      setEnrollments(data)
    } catch (err) {
      console.error('Failed to load enrollments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (enrollment: Enrollment) => {
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
              description: "You closed the payment popup. You can pay anytime.",
            })
          },
        })
      } else {
        throw new Error(response.message || 'Payment initiation failed')
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

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    return student?.fullName || 'Unknown'
  }

  // Group enrollments by enrollmentGroupId
  const groupEnrollments = (): EnrollmentGroup[] => {
    const groups: Record<string, EnrollmentGroup> = {}
    
    enrollments.forEach(enrollment => {
      const groupId = enrollment.enrollmentGroupId || enrollment.id // Use enrollment ID as fallback for single enrollments
      
      if (!groups[groupId]) {
        groups[groupId] = {
          groupId: enrollment.enrollmentGroupId || null,
          enrollments: [],
          createdAt: enrollment.createdAt,
        }
      }
      
      groups[groupId].enrollments.push(enrollment)
    })
    
    return Object.values(groups).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const enrollmentGroups = groupEnrollments()

  const columns = [
    {
      key: 'student',
      header: 'Student',
      cell: (enrollment: Enrollment) => (
        <div className="font-medium text-white">{getStudentName(enrollment.studentId)}</div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (enrollment: Enrollment) => {
        const subject = enrollment.subject
        return subject ? (
          <div className="text-gray-300">{subject.name}</div>
        ) : (
          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{enrollment.subjectId}</code>
        )
      },
    },
    {
      key: 'frequency',
      header: 'Frequency',
      cell: (enrollment: Enrollment) => (
        <div className="text-gray-300">{enrollment.sessionFrequency}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (enrollment: Enrollment) => (
        <StatusBadge status={enrollment.status} />
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      cell: (enrollment: Enrollment) => (
        <div className="text-gray-300">{new Date(enrollment.startDate).toLocaleDateString()}</div>
      ),
    },
    {
      key: 'tutor',
      header: 'Tutor',
      cell: (enrollment: Enrollment) => (
        enrollment.tutorId ? (
          <span className="text-sm text-brand-gold">Assigned</span>
        ) : (
          <span className="text-sm text-gray-400">Unassigned</span>
        )
      ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: (enrollment: Enrollment) => (
        enrollment.status === 'PENDING_PAYMENT' ? (
          <Button
            size="sm"
            onClick={() => handlePay(enrollment)}
            disabled={payingId === enrollment.id}
            className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark text-xs font-semibold px-3 py-1"
          >
            {payingId === enrollment.id ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Paying...
              </>
            ) : (
              <>
                <CreditCard className="h-3 w-3 mr-1" />
                Pay Now
              </>
            )}
          </Button>
        ) : null
      ),
    },
  ]

  return (
    <Card className="bg-card border-brand-gold/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-brand-gold" />
            My Enrollments
          </CardTitle>
          <Button
            onClick={onEnrollStudent}
            size="sm"
            className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading enrollments...</div>
          </div>
        ) : enrollmentGroups.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No enrollments yet</h3>
            <p className="text-muted-foreground">Create your first enrollment to start tutoring</p>
          </div>
        ) : (
          <div className="space-y-6">
            {enrollmentGroups.map((group) => {
              const hasPendingPayment = group.enrollments.some(e => e.status === 'PENDING_PAYMENT')
              return (
                <div key={group.groupId || group.enrollments[0].id} className="space-y-3">
                  {group.groupId && (
                    <div className="flex items-center justify-between text-sm text-brand-gold bg-brand-gold/10 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        <span className="font-medium">
                          Enrolled together on {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400">
                          ({group.enrollments.length} subject{group.enrollments.length > 1 ? 's' : ''})
                        </span>
                      </div>
                      {hasPendingPayment && (
                        <Button
                          size="sm"
                          onClick={() => handlePay(group.enrollments[0])}
                          disabled={!!payingId}
                          className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark text-xs"
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Pay for Group
                        </Button>
                      )}
                    </div>
                  )}
                  <DataTable
                    data={group.enrollments}
                    columns={columns}
                    loading={false}
                    emptyState={undefined}
                  />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
