'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { MessageThread, Message } from '@/lib/types'
import { MessageSquare, Send, ArrowLeft, RefreshCw, User, GraduationCap } from 'lucide-react'

export default function StudentMessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const currentUser = typeof window !== 'undefined' ? getUser() : null

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadThreads()
  }, [router])

  const loadThreads = async () => {
    setLoading(true)
    try {
      const data = await api.getMessageThreads()
      setThreads(Array.isArray(data) ? data : [])
      if (data && data.length > 0 && !selectedThread) {
        handleSelectThread(data[0])
      }
    } catch (err) {
      console.error('Failed to load message threads:', err)
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (threadId: string) => {
    if (!threadId) {
      console.error('Invalid threadId: threadId is undefined')
      return
    }
    try {
      const data = await api.getMessages(threadId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread)
    loadMessages(thread.id)
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
      await loadMessages(selectedThread.id)
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

  const getTutorParticipant = (thread: MessageThread) => {
    // Handle both API response structures: otherParticipant (new) or participants array (old)
    if (thread.otherParticipant) {
      return thread.otherParticipant.fullName
    }
    const tutor = thread.participants?.find(p => p.role === 'TUTOR')
    return tutor ? tutor.fullName : 'Assigned Tutor'
  }

  return (
    <div className="space-y-6 pb-12 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Tutor Messages</h1>
              <p className="text-sm text-gray-400">Direct questions and lesson assistance with your tutor</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadThreads}
            disabled={loading}
            className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Messaging Interface */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : threads.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-16">
            <CardContent>
              <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">No Message Threads</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Once a tutor is assigned to your enrolled courses, your conversation thread will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1 grid md:grid-cols-3 gap-6 bg-card border border-brand-gold/30 rounded-xl overflow-hidden min-h-[550px]">
            {/* Thread List Sidebar */}
            <div className="border-r border-brand-gold/15 bg-brand-dark/40 flex flex-col">
              <div className="p-4 border-b border-brand-gold/15">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-brand-gold">
                  Conversations
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-brand-gold/10">
                {threads.map((thread) => {
                  const tutorName = getTutorParticipant(thread)
                  const isSelected = selectedThread?.id === thread.id
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => handleSelectThread(thread)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'bg-brand-gold/15 border-l-4 border-l-brand-gold'
                          : 'hover:bg-brand-gold/5'
                      }`}
                    >
                      <div className="p-2 rounded-full bg-brand-gold/20 text-brand-gold shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{tutorName}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {thread.lastMessage?.body || thread.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Chat View */}
            <div className="md:col-span-2 flex flex-col justify-between h-full bg-brand-dark/20">
              {selectedThread ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-brand-gold/15 bg-brand-dark/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-brand-gold/20 text-brand-gold">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white">
                          {getTutorParticipant(selectedThread)}
                        </h2>
                        <span className="text-xs text-brand-gold">Your Assigned Tutor</span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 text-xs">
                        Say hello to your tutor! Ask questions about your homework or next class.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === currentUser?.id
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-brand-gold text-brand-dark font-medium rounded-tr-none'
                                  : 'bg-card border border-brand-gold/20 text-white rounded-tl-none'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content || msg.body || ''}</p>
                              <span
                                className={`text-[10px] block mt-1 text-right ${
                                  isMe ? 'text-brand-dark/70 font-semibold' : 'text-gray-400'
                                }`}
                              >
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

                  {/* Send Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-gold/15 bg-brand-dark/60 flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message to your tutor..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="bg-card border-brand-gold/30 text-white placeholder:text-gray-500"
                    />
                    <Button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold px-5"
                    >
                      {sending ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  Select a tutor conversation to start messaging.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
  )
}
