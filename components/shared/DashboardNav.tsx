'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Avatar } from '@/components/shared/Avatar'
import { Bell, LogOut, User, Settings, MessageSquare, CreditCard, FileText, Calendar, Users, BookOpen, BarChart3, Shield, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { getUser } from '@/lib/auth'

interface DashboardNavProps {
  role: 'PARENT' | 'TUTOR' | 'ADMIN' | 'STUDENT'
  unreadCount?: number
}

export function DashboardNav({ role, unreadCount = 0 }: DashboardNavProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeUnreadCount, setActiveUnreadCount] = useState<number>(unreadCount)
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    let isMounted = true
    const fetchUnread = async () => {
      try {
        const notifs = role === 'STUDENT' ? await api.getStudentNotifications() : await api.getNotifications()
        if (isMounted && Array.isArray(notifs)) {
          const unread = notifs.filter(n => !n.read).length
          setActiveUnreadCount(unread)
        }
      } catch {
        // Silently ignore if unauthenticated or network error
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 45000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [role])

  const handleLogout = async () => {
    try {
      await api.logout()
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      })
      router.push('/')
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error instanceof Error ? error.message : 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  const navItems = {
    PARENT: [
      { label: 'My Children', icon: Users, href: '/parent/students' },
      { label: 'Enrollments', icon: BookOpen, href: '/parent/enrollments' },
      { label: 'Sessions', icon: Calendar, href: '/parent/sessions' },
      { label: 'Assignments', icon: FileText, href: '/parent/assignments' },
      { label: 'Grades', icon: BarChart3, href: '/parent/grades' },
      { label: 'Payments', icon: CreditCard, href: '/parent/payments' },
      { label: 'Messages', icon: MessageSquare, href: '/parent/messages' },
      { label: 'Message Admin', icon: Shield, href: '/parent/messages?action=message-admin' },
      { label: 'Settings', icon: Settings, href: '/parent/settings' },
    ],
    TUTOR: [
      { label: 'My Students', icon: Users, href: '/tutor/students' },
      { label: 'Sessions', icon: Calendar, href: '/tutor/sessions' },
      { label: 'Assignments', icon: FileText, href: '/tutor/assignments' },
      { label: 'Grades', icon: BarChart3, href: '/tutor/grades' },
      { label: 'Progress Reports', icon: FileText, href: '/tutor/progress-reports' },
      { label: 'Messages', icon: MessageSquare, href: '/tutor/messages' },
      { label: 'Message Admin', icon: Shield, href: '/tutor/messages?action=message-admin' },
      { label: 'Profile', icon: User, href: '/tutor/profile' },
      { label: 'Settings', icon: Settings, href: '/tutor/settings' },
    ],
    STUDENT: [
      { label: 'Schedule', icon: Calendar, href: '/student/schedule' },
      { label: 'My Tutors', icon: Users, href: '/student/my-tutors' },
      { label: 'Assignments', icon: FileText, href: '/student/assignments' },
      { label: 'Grades', icon: BarChart3, href: '/student/grades' },
      { label: 'Progress Reports', icon: FileText, href: '/student/progress-reports' },
      { label: 'Attendance', icon: Calendar, href: '/student/attendance' },
      { label: 'Messages', icon: MessageSquare, href: '/student/messages' },
      { label: 'Profile', icon: User, href: '/student/profile' },
    ],
    ADMIN: [
      { label: 'Overview', icon: BarChart3, href: '/admin' },
      { label: 'Pending Tutors', icon: Users, href: '/admin/tutors/pending' },
      { label: 'All Tutors', icon: Users, href: '/admin/tutors' },
      { label: 'All Students', icon: Users, href: '/admin/students' },
      { label: 'Unmatched Enrollments', icon: BookOpen, href: '/admin/enrollments/unmatched' },
      { label: 'Pricing Tiers', icon: CreditCard, href: '/admin/pricing' },
      { label: 'Sessions', icon: Calendar, href: '/admin/sessions' },
      { label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
      { label: 'Complaints', icon: Shield, href: '/admin/complaints' },
      { label: 'Failed Payments', icon: CreditCard, href: '/admin/payments/failed' },
      { label: 'Settings', icon: Settings, href: '/admin/settings' },
    ],
  }

  const items = navItems[role] || []

  return (
    <header className="border-b border-brand-gold/20 bg-brand-dark/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <BrandHeader />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => router.push(item.href)}
                  className="text-gray-300 hover:text-brand-gold hover:bg-brand-gold/10"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* User Avatar */}
            {user && (
              <button
                onClick={() => router.push(`/${role.toLowerCase()}/settings`)}
                className="cursor-pointer"
              >
                <Avatar
                  fullName={user.fullName}
                  profilePictureUrl={user.profilePictureUrl}
                  size="md"
                  className=""
                />
              </button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/${role.toLowerCase()}/notifications`)}
              className="text-gray-300 hover:text-brand-gold relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {activeUnreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-brand-gold text-brand-dark text-xs font-bold">
                  {activeUnreadCount > 99 ? '99+' : activeUnreadCount}
                </Badge>
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/${role.toLowerCase()}/settings`)}
              className="text-gray-300 hover:text-brand-gold"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-300 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}