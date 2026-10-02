'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Complaint, ComplaintAboutType } from '@/lib/types'
import { FileText, Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, MessageSquare, ArrowLeft } from 'lucide-react'

export default function ParentComplaintsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [aboutType, setAboutType] = useState<ComplaintAboutType>('GENERAL')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'PARENT') {
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

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please describe the issue in detail.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      await api.fileComplaint({
        aboutType,
        description: description.trim(),
      })
      toast({
        title: 'Complaint Submitted',
        description: 'Your complaint has been submitted. Our admin team will review and reply shortly.',
      })
      setModalOpen(false)
      setDescription('')
      setAboutType('GENERAL')
      loadComplaints()
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err instanceof Error ? err.message : 'Could not submit complaint',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/parent')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Support & Complaints</h1>
              <p className="text-sm text-gray-400">File issues or view feedback and responses from administration</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadComplaints}
              disabled={loading}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              File a Complaint
            </Button>
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : complaints.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No Complaints Filed</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                You haven't submitted any complaints or issues. If you ever have a concern regarding a tutor, session, or account issue, you can file it here.
              </p>
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
              >
                File a Complaint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((item) => (
              <Card key={item.id} className="bg-card border-brand-gold/25 hover:border-brand-gold/40 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold">
                        {item.aboutType}
                      </span>
                      <span className="text-xs text-gray-400">
                        Filed on {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5 ${
                      item.status === 'RESOLVED'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status === 'RESOLVED' ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Resolved
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          Under Review
                        </>
                      )}
                    </span>
                  </div>
                  <CardDescription className="text-white text-base mt-2 whitespace-pre-wrap">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                {item.adminReply && (
                  <CardContent className="pt-0">
                    <div className="bg-brand-dark/70 border border-brand-gold/20 rounded-lg p-4 mt-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold mb-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Admin Reply {item.resolvedAt && `(${new Date(item.resolvedAt).toLocaleDateString()})`}
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {item.adminReply}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

      {/* File Complaint Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="File a Complaint"
        description="Submit your concern to the administration. We take all complaints seriously."
      >
        <form onSubmit={handleFileComplaint} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutType" className="text-gray-300">Category</Label>
            <Select value={aboutType} onValueChange={(val) => setAboutType(val as ComplaintAboutType)}>
              <SelectTrigger className="bg-background border-input text-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TUTOR">Tutor Concern</SelectItem>
                <SelectItem value="STUDENT">Student Issue</SelectItem>
                <SelectItem value="GENERAL">Billing / General Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the situation in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-input text-white resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
