'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { MessageThread, Message } from '@/lib/types'
import {
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  Send,
  Clock,
  CheckCircle2,
  User,
} from 'lucide-react'

export default function TutorMessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadThreads()
  }, [router])

  const loadThreads = async () => {
    setLoading(true)
    try {
      const data = await api.getMessageThreads()
      setThreads(data)
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
    try {
      const data = await api.getThreadMessages(threadId)
      setMessages(data)
    } catch (err) {
      console.error('Failed to load messages:', err)
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      })
    }
  }

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread)
    loadMessages(thread.id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedThread?.otherParticipant?.id) return

    setSending(true)
    try {
      await api.sendMessage({
        recipientId: selectedThread.otherParticipant.id,
        body: newMessage.trim(),
      })
      setNewMessage('')
      loadMessages(selectedThread.id)
      loadThreads() // Refresh to update unread counts
    } catch (err) {
      console.error('Failed to send message:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-6">
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
              <div className="bg-brand-gold/20 p-2.5 rounded-xl border border-brand-gold/30">
                <MessageSquare className="h-6 w-6 text-brand-gold" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Messages</h1>
                <p className="text-sm text-muted-foreground">
                  Contact the admin team for support and inquiries
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadThreads}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threads List */}
          <Card className="bg-card border-brand-gold/30 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
              <CardDescription>
                Message threads with the admin team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No message threads yet
                </div>
              ) : (
                <div className="space-y-2">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => handleSelectThread(thread)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedThread?.id === thread.id
                          ? 'bg-brand-gold/20 border border-brand-gold/30'
                          : 'hover:bg-accent/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {thread.otherParticipant?.fullName}
                        </span>
                        {thread.unreadCount > 0 && (
                          <span className="bg-brand-gold text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {thread.lastMessage?.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {thread.lastMessage?.createdAt ? new Date(thread.lastMessage.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="bg-card border-brand-gold/30 lg:col-span-2">
            {selectedThread ? (
              <>
                <CardHeader className="border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedThread.otherParticipant?.fullName}
                      </CardTitle>
                      <CardDescription>
                        {selectedThread.otherParticipant?.role === 'ADMIN' ? 'Admin Team' : selectedThread.otherParticipant?.role}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === selectedThread.otherParticipant?.id ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.senderId === selectedThread.otherParticipant?.id
                              ? 'bg-muted/50'
                              : 'bg-brand-gold/20 border border-brand-gold/30'
                          }`}
                        >
                          <p className="text-sm">{message.body}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{new Date(message.createdAt).toLocaleString()}</span>
                            {message.readAt && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="self-end"
                    >
                      {sending ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
