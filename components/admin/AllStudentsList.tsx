'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { AdminStudent } from '@/lib/types'
import { DataTable } from '@/components/shared/DataTable'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Users, Eye, Search, TrendingUp } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AllStudentsListProps {
  refreshTrigger?: number
}

export function AllStudentsList({ refreshTrigger }: AllStudentsListProps) {
  const { toast } = useToast()
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadStudents()
  }, [refreshTrigger])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const response = await api.getAdminStudents()
      const data = (response as any)?.data || response
      setStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load students:', err)
      setStudents([])
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.parentName.toLowerCase().includes(search.toLowerCase())

    // Note: Status filtering requires backend support - currently filtering client-side if available
    // This will be more accurate when backend API supports status filter

    return matchesSearch
  })

  const columns = [
    {
      key: 'studentName',
      header: 'Student Name',
      cell: (student: AdminStudent) => (
        <div className="flex items-center gap-3">
          <Avatar
            fullName={student.fullName}
            size="sm"
          />
          <div className="font-medium">{student.fullName}</div>
        </div>
      ),
    },
    {
      key: 'actualGrade',
      header: 'Grade Level',
      cell: (student: AdminStudent) => student.actualGrade,
    },
    {
      key: 'school',
      header: 'School',
      cell: (student: AdminStudent) => student.school || '-',
    },
    {
      key: 'parentName',
      header: 'Parent Name',
      cell: (student: AdminStudent) => student.parentName,
    },
    {
      key: 'dateAdded',
      header: 'Date Added',
      cell: (student: AdminStudent) => new Date(student.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (student: AdminStudent) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => window.location.href = `/admin/students/${student.id}/performance`}
            className="gap-2 border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          >
            <TrendingUp className="h-4 w-4" />
            Performance
          </Button>
          <Button
            size="sm"
            onClick={() => window.location.href = `/admin/students/${student.id}`}
            className="gap-2 bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
          >
            <Eye className="h-4 w-4" />
            Details
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Students</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64 bg-background border-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        data={filteredStudents}
        columns={columns}
        loading={loading}
        emptyState={{
          icon: Users,
          title: "No students found",
          description: "Students will appear here once parents enroll them",
        }}
      />
    </div>
  )
}
