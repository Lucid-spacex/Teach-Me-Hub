'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { User, UserStatus } from '@/lib/types'
import { AlertCircle, ArrowLeft, RefreshCw, UserCheck } from 'lucide-react'

export default function AdminSuspendedPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [reactivating, setReactivating] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadUsers()
  }, [router])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await api.getSuspendedUsers()
      const data = (response as any)?.data || response
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load suspended users:', err)
      toast({
        title: 'Error',
        description: 'Failed to load suspended users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to reactivate this user?')) return

    setReactivating(userId)
    try {
      await api.reactivateUser(userId)
      toast({
        title: 'Success',
        description: 'User has been reactivated successfully',
      })
      loadUsers()
    } catch (err) {
      console.error('Failed to reactivate user:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to reactivate user',
        variant: 'destructive',
      })
    } finally {
      setReactivating(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-brand-gold/20 p-2 rounded-lg border border-brand-gold/30">
              <AlertCircle className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Suspended Users</h1>
              <p className="text-sm text-gray-400">View and reactivate suspended accounts</p>
            </div>
          </div>
        </div>
        <Button
          onClick={loadUsers}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : users.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <UserCheck className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Suspended Users</h3>
            <p className="text-sm text-gray-400">All accounts are currently active</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">{user.fullName}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">{user.email}</p>
                    <p className="text-sm text-gray-400">Role: {user.role}</p>
                  </div>
                  <StatusBadge status={user.status as UserStatus} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Account Status</p>
                    <p className="text-white">{user.status}</p>
                  </div>
                  <Button
                    onClick={() => handleReactivate(user.id)}
                    disabled={reactivating === user.id}
                    className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                  >
                    {reactivating === user.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Reactivate Account'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
