'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Notification } from '@/lib/types'
import { Bell, Check, ArrowLeft, RefreshCw, Calendar, MessageSquare, BookOpen, Clock, GraduationCap } from 'lucide-react'

export default function StudentNotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadNotifications()
  }, [router])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await api.getStudentNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    setMarkingId(id)
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      toast({
        title: 'Marked as Read',
        description: 'Notification has been marked as read.',
      })
    } catch (err) {
      toast({
        title: 'Action Failed',
        description: 'Could not update notification status',
        variant: 'destructive',
      })
    } finally {
      setMarkingId(null)
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'TUTOR_ASSIGNED':
        return <GraduationCap className="h-5 w-5 text-emerald-400" />
      case 'SESSION':
        return <Calendar className="h-5 w-5 text-blue-400" />
      case 'MESSAGE':
        return <MessageSquare className="h-5 w-5 text-purple-400" />
      case 'ASSIGNMENT':
        return <BookOpen className="h-5 w-5 text-amber-400" />
      default:
        return <Bell className="h-5 w-5 text-brand-gold" />
    }
  }

  const filtered = notifications.filter(n => filter === 'ALL' || !n.read)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                Student Notifications
                {unreadCount > 0 && (
                  <span className="text-xs bg-brand-gold text-brand-dark px-2.5 py-0.5 rounded-full font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-400">Class announcements, new assignments, and messages from your tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
              disabled={loading}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
            <div className="flex rounded-lg bg-card border border-brand-gold/20 p-1">
              <Button
                variant={filter === 'ALL' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('ALL')}
                className={filter === 'ALL' ? 'bg-brand-gold text-brand-dark text-xs h-7' : 'text-gray-400 text-xs h-7'}
              >
                All
              </Button>
              <Button
                variant={filter === 'UNREAD' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('UNREAD')}
                className={filter === 'UNREAD' ? 'bg-brand-gold text-brand-dark text-xs h-7' : 'text-gray-400 text-xs h-7'}
              >
                Unread
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-card border-brand-gold/30 text-center py-12">
            <CardContent>
              <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">
                {filter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications'}
              </h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                {filter === 'UNREAD' ? "You're all caught up!" : "You don't have any notifications right now."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  !item.read
                    ? 'bg-card border-brand-gold/40 shadow-sm'
                    : 'bg-brand-dark/60 border-brand-gold/15 opacity-85'
                }`}
              >
                <div className="p-2.5 rounded-full bg-brand-gold/10 shrink-0 mt-0.5">
                  {getIconForType(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-base font-semibold ${!item.read ? 'text-white' : 'text-gray-300'}`}>
                      {item.title}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap leading-relaxed">
                    {item.message}
                  </p>
                </div>
                {!item.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(item.id)}
                    disabled={markingId === item.id}
                    className="shrink-0 text-brand-gold hover:text-white hover:bg-brand-gold/20 text-xs"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
  )
}
