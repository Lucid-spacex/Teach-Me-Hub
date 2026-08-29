'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { TutorStudent } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TutorStudentListProps {
  refreshTrigger?: number
}

export function TutorStudentList({ refreshTrigger }: TutorStudentListProps) {
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
            className="h-8 w-8 p-0"
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
        <div className="font-medium">{item.student?.fullName || 'N/A'}</div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      cell: (item: TutorStudent) => item.student?.gradeLevel || 'N/A',
    },
    {
      key: 'subject',
      header: 'Subject ID',
      cell: (item: TutorStudent) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{item.enrollment?.subjectId || 'N/A'}</code>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      cell: (item: TutorStudent) => item.enrollment?.frequency || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item: TutorStudent) => (
        <StatusBadge status={item.enrollment?.status || 'UNKNOWN'} />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">My Assigned Students</h2>

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
          <div key={studentId} className="border rounded-lg p-4 mt-2 bg-muted/50">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Student Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Date of Birth:</span> {item.student?.dateOfBirth ? new Date(item.student.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  <p><span className="text-muted-foreground">School:</span> {item.student?.school || 'N/A'}</p>
                  {item.student?.notes && (
                    <p><span className="text-muted-foreground">Notes:</span> {item.student.notes}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Enrollment Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Enrollment ID:</span> <code className="text-xs">{item.enrollment?.id || 'N/A'}</code></p>
                  <p><span className="text-muted-foreground">Start Date:</span> {item.enrollment?.startDate ? new Date(item.enrollment.startDate).toLocaleDateString() : 'N/A'}</p>
                  {item.enrollment?.endDate && (
                    <p><span className="text-muted-foreground">End Date:</span> {new Date(item.enrollment.endDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
