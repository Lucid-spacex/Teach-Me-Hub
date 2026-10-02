'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, Loader2, User } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { MessageThread, Message } from '@/lib/types'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Avatar } from '@/components/shared/Avatar'

export default function ParentMessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewThread, setShowNewThread] = useState(false)

  useEffect(() => {
    loadThreads()
    
    // Check if we should start a new admin conversation
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('action') === 'message-admin') {
      // Clear the URL parameter
      window.history.replaceState({}, '', '/parent/messages')
      // Trigger admin message
      setTimeout(() => handleStartNewThread(), 100)
    }
  }, [])

  const loadThreads = async () => {
    try {
      const data = await api.getMessageThreads()
      setThreads(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load message threads:', error)
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
    } catch (error) {
      console.error('Failed to load messages:', error)
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

  const handleSendMessage = async () => {
    if (!selectedThread || !newMessage.trim()) return

    setSending(true)
    try {
      // Get the other participant from the thread
      const otherParticipant = selectedThread.otherParticipant || selectedThread.participants?.[0]
      if (!otherParticipant) {
        throw new Error('No recipient found')
      }

      console.log('Sending message - Thread:', selectedThread)
      console.log('Sending message - Other participant:', otherParticipant)
      console.log('Sending message - Message text:', newMessage)

      // Handle admin thread specially
      if (selectedThread.id === 'admin') {
        if (!otherParticipant.id) {
          throw new Error('Admin recipient ID is missing')
        }
        console.log('Sending message to admin with ID:', otherParticipant.id)
        await api.sendMessage({
          recipientId: otherParticipant.id,
          body: newMessage
        })
        setNewMessage('')
        // Reload threads to get the actual admin thread
        await loadThreads()
        // Find and select the admin thread
        const adminThread = threads.find(t => {
          const participant = t.otherParticipant || t.participants?.[0]
          return participant?.role === 'ADMIN'
        })
        if (adminThread) {
          setSelectedThread(adminThread)
          await loadMessages(adminThread.id)
        }
      } else {
        const recipientId = 'recipientId' in otherParticipant ? otherParticipant.recipientId : otherParticipant.id
        if (!recipientId) {
          throw new Error('Recipient ID is missing')
        }
        await api.sendMessage(recipientId, newMessage)
        setNewMessage('')
        await loadMessages(selectedThread.id)
        await loadThreads() // Refresh to update last message
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleStartNewThread = async () => {
    // Check if admin thread already exists
    const adminThread = threads.find(t => {
      const participant = t.otherParticipant || t.participants?.[0]
      return participant?.role === 'ADMIN'
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
      setShowNewThread(false)

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-[#D4A017] animate-spin" />
        <p className="text-sm text-zinc-400 font-medium">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <p className="text-gray-400 mt-2">Communicate with the administration team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-brand-gold" />
                    Conversations
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={handleStartNewThread}
                    className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                  >
                    Message Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {threads.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {threads.map((thread) => {
                      const participant = thread.otherParticipant || thread.participants?.[0]
                      return (
                        <div
                          key={thread.id}
                          onClick={() => handleSelectThread(thread)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedThread?.id === thread.id
                              ? 'bg-brand-gold/20 border border-brand-gold/30'
                              : 'bg-brand-dark/50 hover:bg-brand-gold/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar
                              fullName={participant?.fullName || 'Unknown'}
                              profilePictureUrl={'profilePictureUrl' in (participant || {}) && participant?.profilePictureUrl ? participant.profilePictureUrl : undefined}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white truncate">
                                  {participant?.fullName || 'Unknown'}
                                </p>
                                {thread.unreadCount > 0 && (
                                  <span className="bg-brand-gold text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full">
                                    {thread.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-1">
                                {thread.lastMessage?.body || thread.lastMessage?.content || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-brand-gold/30 h-[600px] flex flex-col">
              {selectedThread ? (
                <>
                  <CardHeader className="border-b border-brand-gold/20">
                    <CardTitle className="text-white">
                      {selectedThread.otherParticipant?.fullName || selectedThread.participants?.map(p => p.fullName).join(', ') || 'Unknown'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null
                        const isCurrentUser = currentUser && message.senderId === currentUser.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                isCurrentUser
                                  ? 'bg-brand-gold text-brand-dark'
                                  : 'bg-brand-dark/50 text-white'
                              }`}
                            >
                              <p className="text-sm">{message.content || message.body || ''}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t border-brand-gold/20">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="bg-background border-input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
  )
}