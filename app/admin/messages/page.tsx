'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Avatar } from '@/components/shared/Avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { MessageThread, Message } from '@/lib/types'
import { MessageSquare, ArrowLeft, Send, RefreshCw, Search, Mail, User } from 'lucide-react'

export default function AdminMessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [filteredThreads, setFilteredThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [newMessageRecipient, setNewMessageRecipient] = useState('')
  const [newMessageBody, setNewMessageBody] = useState('')
  const [startingNewThread, setStartingNewThread] = useState(false)
  const [usersList, setUsersList] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const currentUser = typeof window !== 'undefined' ? getUser() : null

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadThreads()
  }, [router])

  useEffect(() => {
    // Filter threads based on search and unread status
    let filtered = threads

    if (showUnreadOnly) {
      filtered = filtered.filter(t => t.unreadCount > 0)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(t => {
        const participantName = t.otherParticipant?.fullName || t.participants?.[0]?.fullName || ''
        return participantName.toLowerCase().includes(searchLower)
      })
    }

    setFilteredThreads(filtered)
  }, [threads, search, showUnreadOnly])

  useEffect(() => {
    // Poll for new messages every 2 minutes to avoid rate limiting
    const interval = setInterval(() => {
      if (!loading) {
        loadThreads()
        if (selectedThread) {
          loadMessages(selectedThread.id)
        }
      }
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [loading, selectedThread])

  const loadThreads = async (forceRefresh = false) => {
    // Check cache first if not forcing refresh
    const cacheKey = 'adminMessageThreadsCache'
    const cacheTimestampKey = 'adminMessageThreadsCacheTimestamp'
    const cacheExpiry = 2 * 60 * 1000 // 2 minutes

    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey)
      const cachedTimestamp = localStorage.getItem(cacheTimestampKey)

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10)
        const now = Date.now()

        if (now - timestamp < cacheExpiry) {
          console.log('Using cached message threads')
          const parsedData = JSON.parse(cachedData)
          setThreads(Array.isArray(parsedData) ? parsedData : [])
          if (parsedData && parsedData.length > 0 && !selectedThread) {
            handleSelectThread(parsedData[0])
          }
          return
        }
      }
    }

    setLoading(true)
    try {
      const data = await api.getMessageThreads()
      setThreads(Array.isArray(data) ? data : [])

      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())

      if (data && data.length > 0 && !selectedThread) {
        handleSelectThread(data[0])
      }
    } catch (err) {
      console.error('Failed to load message threads:', err)

      // Try to use cached data as fallback
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData && !forceRefresh) {
        console.log('Using cached threads as fallback')
        const parsedData = JSON.parse(cachedData)
        setThreads(Array.isArray(parsedData) ? parsedData : [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (threadId: string, forceRefresh = false) => {
    if (!threadId) return

    // Check cache first if not forcing refresh
    const cacheKey = `adminMessages_${threadId}`
    const cacheTimestampKey = `adminMessages_${threadId}_timestamp`
    const cacheExpiry = 1 * 60 * 1000 // 1 minute

    if (!forceRefresh) {
      const cachedData = localStorage.getItem(cacheKey)
      const cachedTimestamp = localStorage.getItem(cacheTimestampKey)

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10)
        const now = Date.now()

        if (now - timestamp < cacheExpiry) {
          console.log('Using cached messages for thread:', threadId)
          setMessages(Array.isArray(JSON.parse(cachedData)) ? JSON.parse(cachedData) : [])
          return
        }
      }
    }

    try {
      const data = await api.getMessages(threadId)
      setMessages(Array.isArray(data) ? data : [])

      // Cache the data
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheTimestampKey, Date.now().toString())
    } catch (err) {
      console.error('Failed to load messages:', err)

      // Try to use cached data as fallback
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData && !forceRefresh) {
        console.log('Using cached messages as fallback')
        setMessages(Array.isArray(JSON.parse(cachedData)) ? JSON.parse(cachedData) : [])
      }
    }
  }

  const handleSelectThread = async (thread: MessageThread) => {
    setSelectedThread(thread)
    await loadMessages(thread.id)
    // Don't auto-reload threads - this was causing excessive API calls
    // The polling interval will handle updates
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedThread || !newMessage.trim()) return

    const content = newMessage.trim()
    const otherParticipant = selectedThread.otherParticipant || selectedThread.participants?.[0]
    if (!otherParticipant) {
      toast({
        title: 'Error',
        description: 'No recipient found',
        variant: 'destructive',
      })
      return
    }
    setSending(true)
    try {
      const recipientId = 'recipientId' in otherParticipant ? otherParticipant.recipientId : otherParticipant.id
      if (!recipientId) {
        throw new Error('Recipient ID is missing')
      }
      await api.sendMessage(recipientId, content)
      setNewMessage('')
      await loadMessages(selectedThread.id, true) // Force refresh
      const updatedThreads = await api.getMessageThreads().catch(() => threads)
      setThreads(updatedThreads)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const getSenderName = (senderId: string) => {
    if (senderId === currentUser?.id) return 'You'
    const participant = selectedThread?.otherParticipant || selectedThread?.participants?.[0]
    return participant?.fullName || 'Unknown'
  }

  const handleStartNewConversation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newMessageBody.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a user and provide a message',
        variant: 'destructive',
      })
      return
    }

    setStartingNewThread(true)
    try {
      await api.sendMessage(selectedUser.id, newMessageBody.trim())
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully',
      })
      setShowNewMessageModal(false)
      setSelectedUser(null)
      setNewMessageBody('')
      setUserSearch('')
      // Reload threads to show the new conversation
      await loadThreads(true) // Force refresh
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setStartingNewThread(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const [parents, tutors] = await Promise.all([
        api.getParentDirectory({ limit: 50 }).catch(() => ({ data: [] })),
        api.getTutors().catch(() => ({ data: [] })),
      ])

      const parentUsers = (parents.data || []).map((p: any) => ({
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        role: 'PARENT',
        status: p.status,
      }))

      const tutorUsers = (tutors.data || []).map((t: any) => ({
        id: t.id,
        fullName: t.fullName,
        email: t.email,
        role: 'TUTOR',
        status: t.status,
      }))

      setUsersList([...parentUsers, ...tutorUsers])
    } catch (err) {
      console.error('Failed to load users:', err)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleOpenNewMessageModal = () => {
    setShowNewMessageModal(true)
    loadUsers()
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
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">Messages</h1>
            <p className="text-sm text-gray-400">Admin inbox - view and reply to parent/tutor messages</p>
          </div>
        </div>
        <Button
          onClick={() => loadThreads(true)}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button
          onClick={handleOpenNewMessageModal}
          className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
        >
          <Mail className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Messaging Interface */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : threads.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Messages</h3>
            <p className="text-sm text-gray-400">No message threads yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 bg-card border border-brand-gold/30 rounded-xl overflow-hidden min-h-[550px]">
          {/* Thread List */}
          <div className="border-r border-brand-gold/15 bg-brand-dark/40">
            <div className="p-4 border-b border-brand-gold/15 space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-gold">
                Conversations
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-brand-dark/30 border-brand-gold/30 text-white placeholder:text-gray-500 text-sm h-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unread-only"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-gray-600"
                />
                <label htmlFor="unread-only" className="text-xs text-gray-400 cursor-pointer">
                  Unread only
                </label>
              </div>
            </div>
            <div className="divide-y divide-brand-gold/10">
              {filteredThreads.map((thread) => {
                const participant = thread.otherParticipant || thread.participants?.[0]
                const participantName = participant?.fullName || 'Unknown'
                const participantRole = participant?.role || 'UNKNOWN'
                const isSelected = selectedThread?.id === thread.id
                return (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full text-left p-4 transition-colors ${
                      isSelected
                        ? 'bg-brand-gold/15 border-l-4 border-l-brand-gold'
                        : 'hover:bg-brand-gold/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        fullName={participantName}
                        profilePictureUrl={participant?.profilePictureUrl}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white truncate">{participantName}</p>
                          {thread.unreadCount > 0 && (
                            <span className="bg-brand-gold text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            participantRole === 'PARENT' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {participantRole}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-1">
                          {thread.lastMessage?.body || thread.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat View */}
          <div className="md:col-span-2 flex flex-col h-full bg-brand-dark/20">
            {selectedThread ? (
              <>
                <div className="p-4 border-b border-brand-gold/15 bg-brand-dark/50">
                  <h2 className="text-sm font-bold text-white">
                    {selectedThread.otherParticipant?.fullName || selectedThread.participants?.[0]?.fullName || 'Conversation'}
                  </h2>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 text-xs">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id
                      const senderName = getSenderName(msg.senderId)
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                            isMe
                              ? 'bg-brand-gold text-brand-dark font-medium rounded-tr-none'
                              : 'bg-card border border-brand-gold/20 text-white rounded-tl-none'
                          }`}>
                            {!isMe && (
                              <p className="text-xs text-brand-gold mb-1 font-medium">{senderName}</p>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content || msg.body || ''}</p>
                            <span className="text-[10px] block mt-1 text-right opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-gold/15 bg-brand-dark/60 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-card border-brand-gold/30 text-white placeholder:text-gray-500 rounded-lg px-4 py-2"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                  >
                    {sending ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-brand-gold/30 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle className="text-white">Start New Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <form onSubmit={handleStartNewConversation} className="space-y-4">
                <div>
                  <Label htmlFor="user-search" className="text-gray-300">Search Users</Label>
                  <Input
                    id="user-search"
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="bg-brand-dark/30 border-brand-gold/30 text-white mt-2"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Select a User</Label>
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                    {loadingUsers ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner size="sm" className="text-brand-gold" />
                      </div>
                    ) : (
                      usersList
                        .filter(user =>
                          !userSearch ||
                          user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => setSelectedUser(user)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedUser?.id === user.id
                                ? 'bg-brand-gold/20 border-brand-gold'
                                : 'bg-brand-dark/30 border-brand-gold/30 hover:bg-brand-gold/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{user.fullName}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  user.role === 'PARENT' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {user.role}
                                </span>
                                <StatusBadge status={user.status} />
                              </div>
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <textarea
                    id="message"
                    value={newMessageBody}
                    onChange={(e) => setNewMessageBody(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-brand-dark/30 border-brand-gold/30 text-white mt-2 rounded-lg p-3 min-h-[100px] resize-none"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewMessageModal(false)
                      setSelectedUser(null)
                      setNewMessageBody('')
                      setUserSearch('')
                    }}
                    className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={startingNewThread || !selectedUser}
                    className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                  >
                    {startingNewThread ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
