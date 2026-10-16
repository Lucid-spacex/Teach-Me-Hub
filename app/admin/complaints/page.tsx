'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Complaint } from '@/lib/types'
import { AlertTriangle, ArrowLeft, RefreshCw, CheckCircle, MessageSquare } from 'lucide-react'

export default function AdminComplaintsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadComplaints()
  }, [router])

  const loadComplaints = async () => {
    setLoading(true)
    try {
      const data = await api.getComplaints()
      setComplaints(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load complaints:', err)
      toast({
        title: 'Error',
        description: 'Failed to load complaints',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (complaintId: string) => {
    if (!reply.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a resolution reply',
        variant: 'destructive',
      })
      return
    }

    setResolving(complaintId)
    try {
      await api.resolveComplaint(complaintId, reply)
      toast({
        title: 'Success',
        description: 'Complaint has been resolved',
      })
      setReply('')
      setSelectedComplaint(null)
      loadComplaints()
    } catch (err) {
      console.error('Failed to resolve complaint:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to resolve complaint',
        variant: 'destructive',
      })
    } finally {
      setResolving(null)
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
              <AlertTriangle className="h-5 w-5 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Complaints</h1>
              <p className="text-sm text-gray-400">View and resolve user complaints</p>
            </div>
          </div>
        </div>
        <Button
          onClick={loadComplaints}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : complaints.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Complaints</h3>
            <p className="text-sm text-gray-400">No complaints have been filed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white">
                      Complaint about {complaint.aboutType}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      Filed on {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-white">{complaint.description}</p>
                  </div>

                  {complaint.adminReply && (
                    <div className="bg-brand-dark/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Admin Reply</p>
                      <p className="text-white">{complaint.adminReply}</p>
                    </div>
                  )}

                  {complaint.status === 'OPEN' && (
                    <div className="space-y-2 pt-2">
                      <Textarea
                        placeholder="Type your resolution reply..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        className="bg-brand-dark/30 border-brand-gold/30 text-white min-h-[80px]"
                      />
                      <Button
                        onClick={() => handleResolve(complaint.id)}
                        disabled={resolving === complaint.id}
                        className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                      >
                        {resolving === complaint.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve Complaint
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
