'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Avatar } from '@/components/shared/Avatar'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Enrollment, Session } from '@/lib/types'
import {
  Users,
  Calendar,
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Video,
  Clock,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Mail,
  Send,
} from 'lucide-react'

interface TutorDisplay {
  id: string
  userId: string
  fullName: string
  email?: string
  bio?: string
  subjects: string[]
  enrollmentId: string
  subjectName: string
  profilePictureUrl?: string | null
}

export default function StudentMyTutorsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTutor, setSelectedTutor] = useState<TutorDisplay | null>(null)
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false)
  const [composeModalOpen, setComposeModalOpen] = useState(false)
  const [composeMessage, setComposeMessage] = useState('')
  const [startingChatId, setStartingChatId] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [enrollmentsData, sessionsData] = await Promise.all([
        api.getStudentEnrollments().catch((err) => {
          console.error('Failed to load student enrollments:', err)
          return []
        }),
        api.getStudentSchedule().catch((err) => {
          console.error('Failed to load student schedule:', err)
          return []
        }),
      ])

      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      
      if (enrollmentsData === undefined || enrollmentsData === null) {
        console.error('Enrollments data is undefined/null')
        toast({
          title: 'Permission Error',
          description: 'Unable to access enrollment data. Please contact support if this persists.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Failed to load student tutors:', err)
      toast({
        title: 'Error',
        description: 'Failed to load tutor information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Extract unique assigned tutors from enrollments
  const tutorsList: TutorDisplay[] = []
  const seenTutorIds = new Set<string>()

  enrollments.forEach((enrollment) => {
    if (!enrollment.tutorId) return

    // Look for tutor object on enrollment if populated
    const anyEnrollment = enrollment as any
    const tutorObj = anyEnrollment.tutor || anyEnrollment.assignedTutor
    const tutorUserId = tutorObj?.userId || tutorObj?.id || enrollment.tutorId
    const tutorName = tutorObj?.fullName || tutorObj?.user?.fullName || 'Assigned Tutor'
    const tutorBio = tutorObj?.bio || tutorObj?.profile?.bio || 'Certified subject matter educator with verified credentials.'
    const tutorProfilePicture = tutorObj?.profilePictureUrl || tutorObj?.user?.profilePictureUrl
    const subjectName = enrollment.subject?.name || 'General Studies'

    if (!seenTutorIds.has(tutorUserId)) {
      seenTutorIds.add(tutorUserId)
      tutorsList.push({
        id: tutorObj?.id || enrollment.tutorId,
        userId: tutorUserId,
        fullName: tutorName,
        email: tutorObj?.email || tutorObj?.user?.email,
        bio: tutorBio,
        subjects: [subjectName],
        enrollmentId: enrollment.id,
        subjectName,
        profilePictureUrl: tutorProfilePicture,
      })
    } else {
      const existing = tutorsList.find(t => t.userId === tutorUserId)
      if (existing && !existing.subjects.includes(subjectName)) {
        existing.subjects.push(subjectName)
      }
    }
  })

  const handleOpenSessions = (tutor: TutorDisplay) => {
    setSelectedTutor(tutor)
    setSessionsModalOpen(true)
  }

  const handleMessageTutor = (tutor: TutorDisplay) => {
    setSelectedTutor(tutor)
    setComposeModalOpen(true)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTutor || !composeMessage.trim()) return

    setStartingChatId(selectedTutor.userId)
    try {
      await api.startMessageThread([selectedTutor.userId], composeMessage.trim())
      toast({
        title: 'Message Sent',
        description: `Your message to ${selectedTutor.fullName} has been sent.`,
      })
      setComposeModalOpen(false)
      setComposeMessage('')
      router.push('/student/messages')
    } catch (err) {
      toast({
        title: 'Failed to Send',
        description: err instanceof Error ? err.message : 'Could not send message',
        variant: 'destructive',
      })
    } finally {
      setStartingChatId(null)
    }
  }

  // Get tutor sessions for modal
  const tutorSessions = selectedTutor
    ? sessions.filter(s => s.enrollmentId === selectedTutor.enrollmentId)
    : []

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/student')}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/20 p-2.5 rounded-xl border border-brand-gold/30">
              <GraduationCap className="h-6 w-6 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Tutors</h1>
              <p className="text-sm text-muted-foreground">
                View your assigned subject instructors, their upcoming sessions, and send direct messages.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="gap-2 self-start sm:self-center"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px]">
          <LoadingSpinner size="lg" className="text-brand-gold mb-3" />
          <p className="text-sm text-muted-foreground">Loading your assigned tutors...</p>
        </div>
      ) : tutorsList.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-brand-gold/80" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No tutors assigned yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-5">
              Once our academic coordinators pair your enrollments with vetted expert tutors, their instructor cards will appear right here.
            </p>
            <Button
              variant="outline"
              asChild
              className="text-xs border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold"
            >
              <Link href="/student/schedule">View Class Schedule</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tutorsList.map((tutor) => {
            const tutorUpcoming = sessions
              .filter(s => s.enrollmentId === tutor.enrollmentId && s.status === 'SCHEDULED' && new Date(s.scheduledAt).getTime() > Date.now())
              .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

            return (
              <Card
                key={tutor.userId}
                className="border-border/60 bg-card/60 hover:bg-card hover:border-brand-gold/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar
                      fullName={tutor.fullName}
                      profilePictureUrl={tutor.profilePictureUrl}
                      size="lg"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-base truncate">
                        {tutor.fullName}
                      </h3>
                      <p className="text-xs text-brand-gold font-medium mt-0.5">
                        {tutor.subjects.join(', ')}
                      </p>
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-1">
                        Active Tutor
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Bio */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 bg-background/50 p-2.5 rounded-lg border border-border/30">
                    {tutor.bio}
                  </p>

                  {/* Next session snippet */}
                  <div className="bg-brand-dark/40 p-3 rounded-xl border border-border/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Next Scheduled Class:</span>
                    </div>
                    {tutorUpcoming ? (
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs font-semibold text-foreground">
                          {new Date(tutorUpcoming.scheduledAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {tutorUpcoming.zoomLink && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                            className="h-7 text-xs text-brand-gold hover:bg-brand-gold/10 px-2"
                          >
                            <a href={tutorUpcoming.zoomLink} target="_blank" rel="noopener noreferrer">
                              <Video className="w-3.5 h-3.5 mr-1" />
                              Join
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No upcoming session scheduled</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenSessions(tutor)}
                      className="text-xs border-border hover:border-brand-gold/50 gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      View Sessions
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMessageTutor(tutor)}
                      disabled={startingChatId === tutor.userId}
                      className="text-xs bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {startingChatId === tutor.userId ? 'Opening...' : 'Message'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tutor Sessions Modal */}
      <Modal
        isOpen={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        title={`Sessions with ${selectedTutor?.fullName || 'Tutor'}`}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Coursework and live tutoring sessions scheduled for {selectedTutor?.subjectName}.
          </p>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {tutorSessions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">No sessions recorded yet for this enrollment.</p>
              </div>
            ) : (
              tutorSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl border border-border/50 bg-background/60 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(session.scheduledAt).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Duration: {session.durationMinutes} minutes
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        session.status === 'SCHEDULED'
                          ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30'
                          : session.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}
                    >
                      {session.status}
                    </span>

                    {session.zoomLink && session.status === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        asChild
                        className="h-7 text-xs bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold px-2.5"
                      >
                        <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                          <Video className="w-3.5 h-3.5 mr-1" />
                          Join
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-brand-gold hover:bg-brand-gold/10"
            >
              <Link href="/student/schedule">View Full Schedule &rarr;</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSessionsModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Compose Message Modal */}
      <Modal
        isOpen={composeModalOpen}
        onClose={() => setComposeModalOpen(false)}
        title={`Message ${selectedTutor?.fullName || 'Tutor'}`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Send a message to {selectedTutor?.fullName} regarding {selectedTutor?.subjectName}.
          </p>

          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              rows={4}
              value={composeMessage}
              onChange={(e) => setComposeMessage(e.target.value)}
              required
              className="min-h-[100px]"
            />
            <p className="text-[11px] text-muted-foreground">
              Please be respectful and professional in your communications.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setComposeModalOpen(false)}
              disabled={startingChatId !== null}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!composeMessage.trim() || startingChatId !== null}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
            >
              {startingChatId ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
