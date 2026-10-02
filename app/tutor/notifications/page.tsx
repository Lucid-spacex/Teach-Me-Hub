'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Notification } from '@/lib/types'
import {
  Bell,
  Check,
  ArrowLeft,
  RefreshCw,
  Calendar,
  MessageSquare,
  BookOpen,
  BarChart3,
  GraduationCap,
  Clock,
  CheckCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

export default function TutorNotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadNotifications()
  }, [router])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await api.getNotifications()
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
    } catch {
      toast({
        title: 'Action Failed',
        description: 'Could not update notification status',
        variant: 'destructive',
      })
    } finally {
      setMarkingId(null)
    }
  }

  const handleMarkAllRead = async () => {
    const unreadList = notifications.filter(n => !n.read)
    if (unreadList.length === 0) return

    setMarkingAll(true)
    try {
      await Promise.all(unreadList.map(n => api.markNotificationRead(n.id).catch(() => null)))
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast({
        title: 'All Caught Up',
        description: 'All notifications marked as read.',
      })
    } catch {
      toast({
        title: 'Partial Update',
        description: 'Some notifications could not be marked as read.',
        variant: 'destructive',
      })
    } finally {
      setMarkingAll(false)
    }
  }

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'TUTOR_ASSIGNED':
        return {
          icon: <GraduationCap className="h-5 w-5 text-emerald-400" />,
          actionHref: '/tutor/students',
          actionLabel: 'View Student',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        }
      case 'SESSION':
        return {
          icon: <Calendar className="h-5 w-5 text-sky-400" />,
          actionHref: '/tutor/sessions',
          actionLabel: 'View Sessions',
          badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        }
      case 'MESSAGE':
        return {
          icon: <MessageSquare className="h-5 w-5 text-purple-400" />,
          actionHref: '/tutor/messages',
          actionLabel: 'Open Messages',
          badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        }
      case 'ASSIGNMENT':
        return {
          icon: <BookOpen className="h-5 w-5 text-amber-400" />,
          actionHref: '/tutor/assignments',
          actionLabel: 'Review Assignment',
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        }
      case 'GRADE':
        return {
          icon: <BarChart3 className="h-5 w-5 text-indigo-400" />,
          actionHref: '/tutor/grades',
          actionLabel: 'View Grades',
          badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        }
      default:
        return {
          icon: <Bell className="h-5 w-5 text-brand-gold" />,
          actionHref: null,
          actionLabel: null,
          badgeClass: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
        }
    }
  }

  const filtered = notifications.filter(n => filter === 'ALL' || !n.read)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
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
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-semibold border border-brand-gold/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Stay updated with your student sessions, assignments, and messages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="gap-2 border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold text-xs"
              >
                <CheckCheck className="h-4 w-4" />
                {markingAll ? 'Marking...' : 'Mark all read'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
              disabled={loading}
              className="gap-2 border-border"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('ALL')}
            className={`rounded-lg text-xs font-semibold ${
              filter === 'ALL'
                ? 'bg-brand-gold hover:bg-brand-goldLight text-brand-dark'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'UNREAD' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('UNREAD')}
            className={`rounded-lg text-xs font-semibold ${
              filter === 'UNREAD'
                ? 'bg-brand-gold hover:bg-brand-goldLight text-brand-dark'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <LoadingSpinner size="lg" className="text-brand-gold mb-3" />
            <p className="text-sm text-muted-foreground">Loading your notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-card/40">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-brand-gold/80" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {filter === 'UNREAD'
                  ? "You're all caught up! Switch to 'All' to review previous updates."
                  : 'Updates regarding assigned students, schedule changes, and messages will appear here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const config = getNotificationConfig(notification.type)
              return (
                <Card
                  key={notification.id}
                  className={`transition-all border ${
                    notification.read
                      ? 'border-border/40 bg-card/40 hover:bg-card/70'
                      : 'border-brand-gold/40 bg-card shadow-sm hover:border-brand-gold/70'
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${config.badgeClass}`}>
                        {config.icon}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {notification.title || 'Notification'}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse shrink-0" />
                          )}
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${config.badgeClass}`}>
                            {notification.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(notification.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      {config.actionHref && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs border-brand-gold/30 hover:bg-brand-gold/10 text-brand-gold"
                        >
                          <Link href={config.actionHref} className="flex items-center gap-1">
                            <span>{config.actionLabel}</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}

                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markingId === notification.id}
                          className="text-xs text-muted-foreground hover:text-foreground"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span>{markingId === notification.id ? 'Marking...' : 'Mark read'}</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
