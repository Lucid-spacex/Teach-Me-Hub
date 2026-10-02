'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { MessageThread, Message, TutorStudent } from '@/lib/types'
import {
  MessageSquare,
  Send,
  ArrowLeft,
  RefreshCw,
  User,
  Plus,
  Search,
  Check,
  Clock,
  Shield,
  GraduationCap,
} from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'

export default function TutorMessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // New Conversation Modal
  const [newThreadModalOpen, setNewThreadModalOpen] = useState(false)
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [startingThread, setStartingThread] = useState(false)
  const [initialMessage, setInitialMessage] = useState('')
  const [selectedStudentForThread, setSelectedStudentForThread] = useState<TutorStudent | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUser = typeof window !== 'undefined' ? getUser() : null

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadThreads()
    loadStudents()

    // Check if we should start a new admin conversation
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'message-admin') {
      // Clear the URL parameter
      window.history.replaceState({}, '', '/tutor/messages')
      // Trigger admin message
      setTimeout(() => handleMessageAdmin(), 100)
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadThreads = async () => {
    setLoading(true)
    try {
      const data = await api.getMessageThreads()
      const threadList = Array.isArray(data) ? data : []
      setThreads(threadList)
      if (threadList.length > 0 && !selectedThread) {
        handleSelectThread(threadList[0])
      }
    } catch (err) {
      console.error('Failed to load message threads:', err)
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const data = await api.getTutorStudents()
      setStudents(Array.isArray(data) ? data : [])
    } catch {
      // Ignore if fails
    }
  }

  const loadMessages = async (threadId: string) => {
    if (!threadId) {
      console.error('Invalid threadId: threadId is undefined')
      setLoadingMessages(false)
      return
    }
    setLoadingMessages(true)
    try {
      const data = await api.getMessages(threadId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load messages:', err)
      toast({
        title: 'Error',
        description: 'Failed to load conversation messages',
        variant: 'destructive',
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread)
    // Use thread.id which is the threadId from API
    loadMessages(thread.id)
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedThread || !newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    const otherParticipant = getOtherParticipant(selectedThread)
    setSending(true)
    try {
      console.log('Sending message - Thread:', selectedThread)
      console.log('Sending message - Other participant:', otherParticipant)
      console.log('Sending message - Message text:', messageText)

      // Handle admin thread specially
      if (selectedThread.id === 'admin') {
        if (!otherParticipant.id) {
          throw new Error('Admin recipient ID is missing')
        }
        console.log('Sending message to admin with ID:', otherParticipant.id)
        const sent = await api.sendMessage({
          recipientId: otherParticipant.id,
          body: messageText
        })
        setNewMessage('')
        // Reload threads to get the actual admin thread
        await loadThreads()
        // Find and select the admin thread
        const adminThread = threads.find(t => {
          const other = getOtherParticipant(t)
          return other?.role === 'ADMIN'
        })
        if (adminThread) {
          setSelectedThread(adminThread)
          await loadMessages(adminThread.id)
        }
      } else {
        const sent = await api.sendMessage(otherParticipant.id, messageText)
        setNewMessage('')
        setMessages(prev => [...prev, sent])

        // Update thread list preview
        setThreads(prev =>
          prev.map(t =>
            t.id === selectedThread.id
              ? {
                  ...t,
                  lastMessage: {
                    id: sent.id,
                    body: messageText,
                    content: messageText,
                    createdAt: new Date().toISOString(),
                    senderId: currentUser?.id,
                    readAt: null
                  },
                  lastMessageAt: new Date().toISOString()
                }
              : t
          )
        )
      }
    } catch (err) {
      console.error('Send error:', err)
      toast({
        title: 'Send Error',
        description: err instanceof Error ? err.message : 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStartThreadWithUser = (student: TutorStudent) => {
    setSelectedStudentForThread(student)
    setInitialMessage('')
    setNewThreadModalOpen(true)
  }

  const handleMessageAdmin = async () => {
    // Check if admin thread already exists
    const adminThread = threads.find(t => {
      const other = getOtherParticipant(t)
      return other?.role === 'ADMIN'
    })

    if (adminThread) {
      handleSelectThread(adminThread)
      return
    }

    // Get admin contact info
    try {
      const adminContact = await api.getAdminContact()
      console.log('Admin contact response:', adminContact)

      if (!adminContact.recipientId) {
        throw new Error('Admin contact API did not return a recipientId')
      }

      setNewMessage('')

      // Open compose with admin as recipient
      toast({
        title: 'Message Admin',
        description: 'Type your message below to contact administration',
      })

      // Set up for sending to admin
      setSelectedThread({
        id: 'admin',
        otherParticipant: {
          id: adminContact.recipientId,
          fullName: 'Admin',
          role: 'ADMIN',
        },
        lastMessage: undefined,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      })
    } catch (error) {
      console.error('Failed to get admin contact:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start conversation with admin',
        variant: 'destructive',
      })
    }
  }

  const handleSendInitialMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudentForThread || !initialMessage.trim()) return

    setStartingThread(true)
    try {
      const sent = await api.sendMessage({
        recipientId: selectedStudentForThread.student.id,
        body: initialMessage.trim()
      })
      // Reload threads to get the new thread
      await loadThreads()
      // Find the thread with the student
      const newThread = threads.find(t => t.otherParticipant?.id === selectedStudentForThread.student.id)
      if (newThread) {
        setSelectedThread(newThread)
        loadMessages(newThread.id)
      }
      setNewThreadModalOpen(false)
      setSelectedStudentForThread(null)
      setInitialMessage('')
      toast({
        title: 'Message Sent',
        description: `Your message to ${selectedStudentForThread.student.fullName} has been sent.`,
      })
    } catch (err) {
      toast({
        title: 'Failed to Send',
        description: err instanceof Error ? err.message : 'Could not send message',
        variant: 'destructive',
      })
    } finally {
      setStartingThread(false)
    }
  }

  const getOtherParticipant = (thread: MessageThread) => {
    // Handle both API response structures: otherParticipant (new) or participants array (old)
    if (thread.otherParticipant) {
      return thread.otherParticipant
    }
    const others = thread.participants?.filter(p => p.id !== currentUser?.id)
    return others?.[0] || { fullName: 'Learning Support', role: 'ADMIN' }
  }

  const filteredThreads = threads.filter(thread => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const other = getOtherParticipant(thread)
    const nameMatch = (other?.fullName || '').toLowerCase().includes(q)
    const messageMatch = (thread.lastMessage?.body || thread.lastMessage?.content || '').toLowerCase().includes(q)
    return nameMatch || messageMatch
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/40">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tutor')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold/20 p-2 rounded-xl border border-brand-gold/30">
                <MessageSquare className="h-5 w-5 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Messages</h1>
                <p className="text-xs text-muted-foreground">
                  Direct communication with your assigned students and academic administrators.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadThreads}
              disabled={loading}
              className="gap-2 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMessageAdmin}
              className="gap-1.5 text-xs border-brand-gold text-brand-gold hover:bg-brand-gold/10"
            >
              <Shield className="h-3.5 w-3.5" />
              Message Admin
            </Button>
            <Button
              size="sm"
              onClick={() => setNewThreadModalOpen(true)}
              className="gap-1.5 bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              New Message
            </Button>
          </div>
        </div>

        {/* Messaging Interface */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 min-h-[550px]">
          {/* Threads List Sidebar (4 cols) */}
          <Card className="lg:col-span-4 border-border/60 bg-card/60 flex flex-col h-[600px]">
            <div className="p-3 border-b border-border/40 space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs bg-background/80"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/20 p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <LoadingSpinner size="md" className="text-brand-gold mb-2" />
                  <p className="text-xs text-muted-foreground">Loading chats...</p>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-2">
                  <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-xs text-muted-foreground">No conversations found</p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const other = getOtherParticipant(thread)
                  const isSelected = selectedThread?.id === thread.id
                  return (
                    <button
                      key={thread.id}
                      onClick={() => handleSelectThread(thread)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-gold/15 border border-brand-gold/30'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                    >
                      <Avatar
                        fullName={other.fullName}
                        profilePictureUrl={other.profilePictureUrl}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {other.fullName}
                          </p>
                          {thread.lastMessageAt && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(thread.lastMessageAt).toLocaleDateString(undefined, {
                                month: 'numeric',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {thread.lastMessage?.body || thread.lastMessage?.content || 'No messages yet'}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                            {other.role}
                          </span>
                          {thread.unreadCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-gold text-brand-dark font-bold">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </Card>

          {/* Active Conversation Pane (8 cols) */}
          <Card className="lg:col-span-8 border-border/60 bg-card/60 flex flex-col h-[600px]">
            {selectedThread ? (
              <>
                {/* Chat Header */}
                {(() => {
                  const other = getOtherParticipant(selectedThread)
                  return (
                    <div className="p-3.5 px-5 border-b border-border/40 flex items-center justify-between bg-card/80">
                      <div className="flex items-center gap-3">
                        <Avatar
                          fullName={other.fullName}
                          profilePictureUrl={other.profilePictureUrl}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{other.fullName}</p>
                          <p className="text-[11px] text-muted-foreground capitalize flex items-center gap-1">
                            {other.role === 'ADMIN' ? (
                              <Shield className="w-3 h-3 text-brand-gold" />
                            ) : (
                              <GraduationCap className="w-3 h-3 text-sky-400" />
                            )}
                            {other.role.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadMessages(selectedThread.id)}
                        disabled={loadingMessages}
                        className="text-xs text-muted-foreground hover:text-foreground h-8"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingMessages ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  )
                })()}

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <LoadingSpinner size="md" className="text-brand-gold mb-2" />
                      <p className="text-xs text-muted-foreground">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                      <MessageSquare className="w-10 h-10 text-muted-foreground opacity-40" />
                      <p className="text-sm font-medium text-foreground">No messages yet</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Say hello and send your first message to begin this academic thread.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMe = message.senderId === currentUser?.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm ${
                              isMe
                                ? 'bg-gradient-to-r from-brand-gold to-brand-goldLight text-brand-dark font-medium rounded-br-none'
                                : 'bg-muted/70 text-foreground border border-border/50 rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content || message.body || ''}</p>
                            <div
                              className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                                isMe ? 'text-brand-dark/70' : 'text-muted-foreground'
                              }`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-border/40 bg-card/90 flex items-end gap-2"
                >
                  <Textarea
                    placeholder="Type your message... (Shift+Enter for newline)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="min-h-[42px] max-h-32 text-xs sm:text-sm resize-none bg-background/80"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newMessage.trim() || sending}
                    className="h-[42px] px-4 bg-brand-gold hover:bg-brand-goldLight text-brand-dark shrink-0 font-semibold"
                  >
                    {sending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Send
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-brand-gold/80" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Select a conversation</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Choose a chat from the left panel or click &apos;New Message&apos; to start communicating with your students.
                </p>
                <Button
                  size="sm"
                  onClick={() => setNewThreadModalOpen(true)}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark text-xs font-semibold"
                >
                  Start New Conversation
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal
        isOpen={newThreadModalOpen}
        onClose={() => {
          setNewThreadModalOpen(false)
          setSelectedStudentForThread(null)
          setInitialMessage('')
        }}
        title="Start New Conversation"
      >
        {!selectedStudentForThread ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Select an assigned student to start a conversation.
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {students.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No assigned students found at this time.
                </p>
              ) : (
                students.map((s) => (
                  <button
                    key={s.student.id}
                    onClick={() => handleStartThreadWithUser(s)}
                    disabled={startingThread}
                    className="w-full text-left p-3 rounded-xl border border-border/50 hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold font-bold flex items-center justify-center text-xs">
                        {s.student.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{s.student.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.enrollment.subject?.name || 'Tutoring Course'} • {s.student.actualGrade}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-brand-gold font-medium">Select &rarr;</span>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewThreadModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendInitialMessage} className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold font-bold flex items-center justify-center text-xs">
                {selectedStudentForThread.student.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{selectedStudentForThread.student.fullName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {selectedStudentForThread.enrollment.subject?.name || 'Tutoring Course'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialMessage">Your Message *</Label>
              <Textarea
                id="initialMessage"
                placeholder="Type your message here..."
                rows={4}
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
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
                onClick={() => {
                  setSelectedStudentForThread(null)
                  setInitialMessage('')
                }}
                disabled={startingThread}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!initialMessage.trim() || startingThread}
                className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
              >
                {startingThread ? (
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
        )}
      </Modal>
    </div>
  )
}
