'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { Notification, UnreadCountResponse, NotificationCategory, User } from '@/lib/types'
import { useToast } from '@/components/ui/use-toast'
import { getUser } from '@/lib/auth'

interface NotificationContextType {
  unreadCount: number
  byCategory: Record<NotificationCategory, number>
  notifications: Notification[]
  refreshUnreadCount: () => Promise<void>
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (category?: NotificationCategory) => Promise<void>
  markEntityAsRead: (entityType: string, entityId: string) => Promise<void>
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  hasUnreadForEntity: (entityType: string, entityId: string) => boolean
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [unreadCount, setUnreadCount] = useState(0)
  const [byCategory, setByCategory] = useState<Record<NotificationCategory, number>>({} as Record<NotificationCategory, number>)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [user, setUser] = useState<User | null>(() => {
    return typeof window !== 'undefined' ? getUser() : null
  })
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSoundTimeRef = useRef<number>(0)
  const processedEventIdsRef = useRef<Set<string>>(new Set())

  // Load sound preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notificationSoundEnabled')
      setSoundEnabled(saved === 'true')
    }
  }, [])

  // Save sound preference to localStorage
  const handleSetSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSoundEnabled', enabled.toString())
    }
  }, [])

  // Play notification sound (throttled to max once per 3 seconds)
  const playSound = useCallback(() => {
    if (!soundEnabled) return
    
    const now = Date.now()
    if (now - lastSoundTimeRef.current < 3000) return
    lastSoundTimeRef.current = now

    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch(() => {
        // Fallback to Web Audio API if standard audio fails
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      })
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }, [soundEnabled])

  // Update browser tab title with unread count
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const originalTitle = document.title
      if (unreadCount > 0) {
        document.title = `(${unreadCount > 99 ? '99+' : unreadCount}) Teach-Me-Hub`
      } else {
        document.title = originalTitle
      }
      
      return () => {
        document.title = originalTitle
      }
    }
  }, [unreadCount])

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return
    
    try {
      let response: UnreadCountResponse
      if (user.role === 'ADMIN') {
        response = await api.getAdminUnreadCount()
      } else if (user.role === 'TUTOR') {
        response = await api.getTutorUnreadCount()
      } else if (user.role === 'PARENT') {
        response = await api.getParentUnreadCount()
      } else if (user.role === 'STUDENT') {
        response = await api.getStudentUnreadCount()
      } else {
        return
      }
      
      setUnreadCount(response.total)
      setByCategory(response.byCategory)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [user])

  // Refresh notifications list
  const refreshNotifications = useCallback(async () => {
    if (!user) return
    
    try {
      let response: { notifications: Notification[]; total: number }
      if (user.role === 'ADMIN') {
        response = await api.getAdminNotifications({ limit: 10 })
      } else if (user.role === 'TUTOR') {
        response = await api.getTutorNotifications({ limit: 10 })
      } else if (user.role === 'PARENT') {
        response = await api.getParentNotifications({ limit: 10 })
      } else if (user.role === 'STUDENT') {
        response = await api.getStudentNotificationsFiltered({ limit: 10 })
      } else {
        return
      }
      
      setNotifications(response.notifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [user])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.markNotificationRead(notificationId)
      await refreshUnreadCount()
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [refreshUnreadCount])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (category?: NotificationCategory) => {
    try {
      await api.markAllNotificationsRead(category)
      await refreshUnreadCount()
      await refreshNotifications()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [refreshUnreadCount, refreshNotifications])

  // Mark entity notifications as read
  const markEntityAsRead = useCallback(async (entityType: string, entityId: string) => {
    try {
      await api.markNotificationsReadByEntity(entityType, entityId)
      await refreshUnreadCount()
      await refreshNotifications()
    } catch (error) {
      console.error('Failed to mark entity notifications as read:', error)
    }
  }, [refreshUnreadCount, refreshNotifications])

  // Check if there's an unread notification for a specific entity
  const hasUnreadForEntity = useCallback((entityType: string, entityId: string): boolean => {
    return notifications.some(
      (notification) =>
        !notification.read &&
        notification.entityType === entityType &&
        notification.entityId === entityId
    )
  }, [notifications])

  // Handle incoming SSE notification
  const handleNotification = useCallback((notification: Notification) => {
    const eventId = `${notification.id}-${notification.createdAt}`
    
    // Skip if we've already processed this event
    if (processedEventIdsRef.current.has(eventId)) return
    processedEventIdsRef.current.add(eventId)
    
    // Clean up old event IDs (keep last 1000)
    if (processedEventIdsRef.current.size > 1000) {
      const entries = Array.from(processedEventIdsRef.current)
      processedEventIdsRef.current = new Set(entries.slice(-500))
    }
    
    // Play sound for new live notifications only
    if (!notification.read) {
      playSound()
      
      // Show toast with navigation on click
      const handleClick = () => {
        // Navigate based on notification type
        if (notification.category === 'PAYMENTS' && user?.role === 'PARENT') {
          window.location.href = '/parent/pricing'
        } else if (notification.category === 'COMPLAINTS' && user?.role === 'PARENT') {
          window.location.href = '/parent/complaints'
        }
      }
      
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
        action: notification.category === 'PAYMENTS' || notification.category === 'COMPLAINTS' ? (
          <button onClick={handleClick} className="text-sm font-medium text-primary hover:underline">
            View
          </button>
        ) : undefined,
      })
    }
    
    // Refresh counts and list
    refreshUnreadCount()
    refreshNotifications()
  }, [playSound, refreshUnreadCount, refreshNotifications, toast, user])

  // Setup SSE connection
  const setupSSE = useCallback(async () => {
    if (!user) return
    
    try {
      const { ticket } = await api.getStreamTicket()
      
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      
      // Create new EventSource with ticket
      const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://smart-tutor-9rjd.onrender.com/api'}/notifications/stream?ticket=${ticket}`
      const eventSource = new EventSource(sseUrl)
      eventSourceRef.current = eventSource
      
      eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data)
          handleNotification(notification)
        } catch (error) {
          console.error('Failed to parse SSE notification:', error)
        }
      }
      
      eventSource.onerror = (error) => {
        console.error('SSE error:', error)
        eventSource.close()
        
        // Fallback to polling
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            refreshUnreadCount()
            refreshNotifications()
          }, 30000)
        }
      }
      
      // Clear polling interval if SSE succeeds
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    } catch (error) {
      console.error('Failed to setup SSE:', error)
      
      // Fallback to polling
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(() => {
          refreshUnreadCount()
          refreshNotifications()
        }, 30000)
      }
    }
  }, [user, handleNotification, refreshUnreadCount, refreshNotifications])

  // Initialize notification system
  useEffect(() => {
    if (!user) return
    
    // Initial load
    refreshUnreadCount()
    refreshNotifications()
    
    // Setup SSE with backoff
    let retryCount = 0
    const maxRetries = 3
    const baseDelay = 1000
    
    const attemptSetup = () => {
      if (retryCount < maxRetries) {
        setupSSE()
        retryCount++
      } else {
        // Max retries reached, fallback to polling
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            refreshUnreadCount()
            refreshNotifications()
          }, 30000)
        }
      }
    }
    
    attemptSetup()
    
    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [user, refreshUnreadCount, refreshNotifications, setupSSE])

  // Listen for auth changes
  useEffect(() => {
    const handleUserChanged = () => {
      const freshUser = getUser()
      setUser(freshUser)
    }
    
    window.addEventListener('auth:user-changed', handleUserChanged)
    return () => {
      window.removeEventListener('auth:user-changed', handleUserChanged)
    }
  }, [])

  const contextValue: NotificationContextType = {
    unreadCount,
    byCategory,
    notifications,
    refreshUnreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    markEntityAsRead,
    soundEnabled,
    setSoundEnabled: handleSetSoundEnabled,
    hasUnreadForEntity,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
