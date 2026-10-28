'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { useNotifications } from '@/components/shared/NotificationProvider'
import { api } from '@/lib/api'
import { Notification, NotificationCategory } from '@/lib/types'
import { Bell, Check, ArrowLeft, RefreshCw, Calendar, MessageSquare, BookOpen, Clock, GraduationCap, Users } from 'lucide-react'

export default function TutorNotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { unreadCount, byCategory, refreshNotifications, markAsRead, markAllAsRead } = useNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    loadNotifications()
  }, [router, categoryFilter, page])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const data = await api.getTutorNotifications({
        category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        isRead: filter === 'UNREAD' ? false : undefined,
        page,
        limit: 20,
      })
      setNotifications(data.notifications)
      setTotal(data.total)
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
      await markAsRead(id)
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

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(categoryFilter === 'ALL' ? undefined : categoryFilter)
      await loadNotifications()
      toast({
        title: 'Success',
        description: 'All notifications marked as read.',
      })
    } catch (err) {
      toast({
        title: 'Action Failed',
        description: 'Could not mark all as read',
        variant: 'destructive',
      })
    }
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'SESSION':
        return <Calendar className="h-5 w-5 text-blue-400" />
      case 'MESSAGE':
        return <MessageSquare className="h-5 w-5 text-purple-400" />
      case 'ASSIGNMENT':
        return <BookOpen className="h-5 w-5 text-amber-400" />
      case 'GRADE_APPROVED':
      case 'GRADE_REJECTED':
        return <GraduationCap className="h-5 w-5 text-green-400" />
      default:
        return <Bell className="h-5 w-5 text-brand-gold" />
    }
  }

  const filtered = notifications.filter(n => filter === 'ALL' || !n.read)
  const categoryOptions: Array<{ value: NotificationCategory | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'USERS', label: 'Students' },
    { value: 'SESSIONS', label: 'Sessions' },
    { value: 'MESSAGES', label: 'Messages' },
    { value: 'ASSIGNMENTS', label: 'Assignments' },
    { value: 'GRADES', label: 'Grades' },
  ]

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/tutor')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                Tutor Notifications
                {unreadCount > 0 && (
                  <span className="text-xs bg-brand-gold text-brand-dark px-2.5 py-0.5 rounded-full font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-400">Session reminders, student updates, and grade notifications</p>
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
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Mark All Read
              </Button>
            )}
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <Button
              key={option.value}
              variant={categoryFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setCategoryFilter(option.value)
                setPage(1)
              }}
              className={categoryFilter === option.value 
                ? 'bg-brand-gold text-brand-dark text-xs' 
                : 'border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 text-xs'
              }
            >
              {option.label}
              {option.value !== 'ALL' && byCategory[option.value] > 0 && (
                <span className="ml-1.5 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full text-xs">
                  {byCategory[option.value]}
                </span>
              )}
            </Button>
          ))}
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
                {filter === 'UNREAD' ? "You're all caught up! Check the 'All' tab to see past notifications." : "You don't have any notifications at the moment."}
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

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-400">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              Next
            </Button>
          </div>
        )}
      </div>
  )
}
