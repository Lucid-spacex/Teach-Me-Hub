'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Student } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, RefreshCw, Key, Eye } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface StudentListProps {
  onAddStudent?: () => void
  refreshTrigger?: number
}

export function StudentList({ onAddStudent, refreshTrigger }: StudentListProps) {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [regeneratingPin, setRegeneratingPin] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadStudents()
  }, [refreshTrigger])

  const loadStudents = async () => {
    try {
      const data = await api.getStudents()
      setStudents(data)
    } catch (err) {
      console.error('Failed to load students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegeneratePin = async (studentId: string) => {
    setRegeneratingPin(studentId)
    try {
      await api.regenerateStudentPin(studentId)
      toast({
        title: 'PIN Regenerated',
        description: 'A new PIN has been sent to your email',
      })
    } catch (err) {
      toast({
        title: 'Failed to Regenerate PIN',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setRegeneratingPin(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (student: Student) => (
        <div className="font-medium text-white">{student.fullName}</div>
      ),
    },
    {
      key: 'studentCode',
      header: 'Student Code',
      cell: (student: Student) => (
        <div className="font-mono text-brand-gold">{(student as any).studentCode || '—'}</div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      cell: (student: Student) => student.actualGrade,
    },
    {
      key: 'school',
      header: 'School',
      cell: (student: Student) => student.school || '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (student: Student) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/parent/students/${student.id}`)}
            className="text-brand-gold hover:text-brand-goldLight hover:bg-brand-gold/10"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRegeneratePin(student.id)}
            disabled={regeneratingPin === student.id}
            className="text-brand-gold hover:text-brand-goldLight hover:bg-brand-gold/10"
          >
            {regeneratingPin === student.id ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Key className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Card className="bg-card border-brand-gold/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-gold" />
            My Children
          </CardTitle>
          {onAddStudent && (
            <Button
              onClick={onAddStudent}
              size="sm"
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              Add Student
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full border border-brand-gold/30 p-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">No students yet</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-sm">
              Add your first child to get started with tutoring
            </p>
            {onAddStudent && (
              <Button onClick={onAddStudent} className="mt-4 gap-2 bg-brand-gold hover:bg-brand-goldLight text-brand-dark">
                <Users className="h-4 w-4" />
                Add Your First Child
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            data={students}
            columns={columns}
            loading={loading}
          />
        )}
      </CardContent>
    </Card>
  )
}
