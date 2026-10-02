'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { TutorStudent } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Avatar } from '@/components/shared/Avatar'
import { Users, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TutorStudentListProps {
  refreshTrigger?: number
}

export function TutorStudentList({ refreshTrigger }: TutorStudentListProps) {
  const router = useRouter()
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadStudents()
  }, [refreshTrigger])

  const loadStudents = async () => {
    try {
      const data = await api.getTutorStudents()
      setStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load students:', err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (studentId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedRows(newExpanded)
  }

  const columns = [
    {
      key: 'expand',
      header: '',
      cell: (item: TutorStudent) => {
        const studentId = item.student?.id
        if (!studentId) return null

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRow(studentId)}
            className="h-8 w-8 p-0 text-brand-gold hover:text-brand-goldLight hover:bg-brand-gold/10"
          >
            {expandedRows.has(studentId) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      key: 'name',
      header: 'Student Name',
      cell: (item: TutorStudent) => (
        <div className="flex items-center gap-3">
          <Avatar
            fullName={item.student?.fullName || 'Student'}
            profilePictureUrl={item.student?.profilePictureUrl}
            size="sm"
          />
          <div className="font-medium text-foreground">{item.student?.fullName || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      cell: (item: TutorStudent) => (
        <div className="text-muted-foreground">{item.student?.actualGrade || 'N/A'}</div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (item: TutorStudent) => {
        const subject = item.enrollment?.subject
        return subject ? (
          <div className="text-muted-foreground">{subject.name}</div>
        ) : (
          <code className="text-xs bg-brand-gold/10 text-brand-gold px-2 py-1 rounded">{item.enrollment?.subjectId || 'N/A'}</code>
        )
      },
    },
    {
      key: 'frequency',
      header: 'Frequency',
      cell: (item: TutorStudent) => (
        <div className="text-muted-foreground">{item.enrollment?.sessionFrequency || 'N/A'}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: TutorStudent) => (
        <StatusBadge status={item.enrollment?.status || 'UNKNOWN'} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (item: TutorStudent) => {
        const studentId = item.student?.id
        if (!studentId) return null
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/tutor/students/${studentId}`)}
            className="text-brand-gold hover:text-brand-goldLight hover:bg-brand-gold/10 text-xs gap-1.5 h-8"
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule &amp; View
          </Button>
        )
      },
    },
  ]

  return (
    <Card className="bg-card border-brand-gold/30">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-gold" />
          My Assigned Students
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={students}
          columns={columns}
          loading={loading}
          emptyState={{
            icon: Users,
            title: "No students assigned",
            description: "Students assigned to you will appear here",
          }}
        />

        {/* Expanded details */}
        {students.map((item) => {
          const studentId = item.student?.id
          if (!studentId || !expandedRows.has(studentId)) return null

          return (
            <div key={studentId} className="border border-brand-gold/20 rounded-lg p-4 mt-2 bg-brand-subtle/50">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Student Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Date of Birth:</span> <span className="text-muted-foreground">{item.student?.dateOfBirth ? new Date(item.student.dateOfBirth).toLocaleDateString() : 'N/A'}</span></p>
                    <p><span className="text-muted-foreground">School:</span> <span className="text-muted-foreground">{item.student?.school || 'N/A'}</span></p>
                    {item.student?.notes && (
                      <p><span className="text-muted-foreground">Notes:</span> <span className="text-muted-foreground">{item.student.notes}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Enrollment Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Enrollment ID:</span> <code className="text-xs text-brand-gold">{item.enrollment?.id || 'N/A'}</code></p>
                    <p><span className="text-muted-foreground">Start Date:</span> <span className="text-muted-foreground">{item.enrollment?.startDate ? new Date(item.enrollment.startDate).toLocaleDateString() : 'N/A'}</span></p>
                    {item.enrollment?.endDate && (
                      <p><span className="text-muted-foreground">End Date:</span> <span className="text-muted-foreground">{new Date(item.enrollment.endDate).toLocaleDateString()}</span></p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-brand-gold/15 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => router.push(`/tutor/students/${studentId}`)}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-bold text-xs gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Manage Student &amp; Schedule Sessions
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
