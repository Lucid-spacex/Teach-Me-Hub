'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from './NotificationProvider'
import { Bell, Volume2, VolumeX, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Notification, NotificationCategory } from '@/lib/types'
import { getUser } from '@/lib/auth'

export function NotificationBell() {
  const router = useRouter()
  const { unreadCount, notifications, markAsRead, markAllAsRead, soundEnabled, setSoundEnabled } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const user = getUser()

  if (!user) return null

  const getNotificationsPath = () => {
    switch (user.role) {
      case 'ADMIN':
        return '/admin/notifications'
      case 'TUTOR':
        return '/tutor/notifications'
      case 'PARENT':
        return '/parent/notifications'
      case 'STUDENT':
        return '/student/notifications'
      default:
        return '/'
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id)
    setIsOpen(false)

    // Navigate based on entityType and entityId
    if (notification.entityType && notification.entityId) {
      const route = getRouteForEntity(notification.entityType, notification.entityId)
      if (route) {
        router.push(route)
        return
      }
    }

    // Fallback to notifications page
    router.push(getNotificationsPath())
  }

  const getRouteForEntity = (entityType: string, entityId: string): string | null => {
    if (!user) return null

    // Role-based route mapping
    switch (user.role) {
      case 'ADMIN':
        return getAdminRoute(entityType, entityId)
      case 'TUTOR':
        return getTutorRoute(entityType, entityId)
      case 'PARENT':
        return getParentRoute(entityType, entityId)
      case 'STUDENT':
        return getStudentRoute(entityType, entityId)
      default:
        return null
    }
  }

  const getAdminRoute = (entityType: string, entityId: string): string | null => {
    switch (entityType) {
      case 'PARENT':
        return `/admin/parents`
      case 'TUTOR':
        return `/admin/tutors/${entityId}`
      case 'STUDENT':
        return `/admin/students/${entityId}`
      case 'SESSION':
        return `/admin/sessions`
      case 'COMPLAINT':
        return `/admin/complaints`
      case 'ENROLLMENT':
        return `/admin/enrollments`
      case 'PAYMENT':
        return `/admin/transactions`
      case 'GRADE':
        return `/admin/grades/${entityId}`
      case 'CHANGE_REQUEST':
        return `/admin/change-requests/${entityId}`
      default:
        return null
    }
  }

  const getTutorRoute = (entityType: string, entityId: string): string | null => {
    switch (entityType) {
      case 'STUDENT':
        return `/tutor/students/${entityId}`
      case 'SESSION':
        return `/tutor/sessions`
      case 'ASSIGNMENT':
        return `/tutor/assignments`
      case 'GRADE':
        return `/tutor/grades`
      case 'MESSAGE':
        return `/tutor/messages`
      default:
        return null
    }
  }

  const getParentRoute = (entityType: string, entityId: string): string | null => {
    switch (entityType) {
      case 'ENROLLMENT':
        return `/parent/enrollments`
      case 'SESSION':
        return `/parent/sessions`
      case 'GRADE':
        return `/parent/grades`
      case 'COMPLAINT':
        return `/parent/complaints`
      case 'MESSAGE':
        return `/parent/messages`
      case 'PRICING':
        return `/parent/pricing`
      default:
        return null
    }
  }

  const getStudentRoute = (entityType: string, entityId: string): string | null => {
    switch (entityType) {
      case 'SESSION':
        return `/student/schedule`
      case 'ASSIGNMENT':
        return `/student/assignments`
      case 'GRADE':
        return `/student/grades`
      case 'MESSAGE':
        return `/student/messages`
      default:
        return null
    }
  }

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label={`Notifications ${unreadCount > 0 ? `(${displayCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {displayCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {unreadCount} unread
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="h-8 px-2"
                    title={soundEnabled ? 'Mute notifications' : 'Enable sound'}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllAsRead()}
                      className="h-8 px-2 text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  router.push(getNotificationsPath())
                }}
                className="w-full"
              >
                View all notifications
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
