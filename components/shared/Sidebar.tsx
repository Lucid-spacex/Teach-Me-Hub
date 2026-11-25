'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { getUser, clearUser } from '@/lib/auth'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useNotifications } from '@/components/shared/NotificationProvider'
import { useBadgeCounts, formatBadgeCount } from '@/hooks/useBadgeCounts'
import { NotificationCategory } from '@/lib/types'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  CreditCard,
  DollarSign,
  MessageSquare,
  AlertCircle,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  UserCheck,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

interface SidebarProps {
  role: 'PARENT' | 'STUDENT' | 'TUTOR' | 'ADMIN'
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  category?: NotificationCategory
  adminBadgeKey?: keyof import('@/hooks/useBadgeCounts').BadgeCounts
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { byCategory } = useNotifications()
  const { counts: badgeCounts, refresh: refreshBadges } = useBadgeCounts()
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const mobileOpenButtonRef = useRef<HTMLButtonElement>(null)
  const drawerCloseButtonRef = useRef<HTMLButtonElement>(null)
  const [user, setUserState] = useState<{ email?: string; name?: string; role?: string; status?: string } | null>(null)

  useEffect(() => {
    const currentUser = getUser()
    setUserState(currentUser)

    // Close mobile drawer on route change
    setMobileOpen(false)

    // Refresh badges on route change
    refreshBadges()
  }, [pathname, refreshBadges])

  useEffect(() => {
    if (!mobileOpen) return

    drawerCloseButtonRef.current?.focus()

    const handleDrawerKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    window.addEventListener('keydown', handleDrawerKeyDown)
    return () => {
      window.removeEventListener('keydown', handleDrawerKeyDown)
      mobileOpenButtonRef.current?.focus()
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    try {
      await api.logout()
      clearUser()
      toast({
        title: 'Logged Out',
        description: 'You have been safely signed out.',
      })
      // Redirect to the matching login page
      if (role === 'STUDENT') {
        router.push('/student-login')
      } else if (role === 'TUTOR') {
        router.push('/tutor/login')
      } else if (role === 'ADMIN') {
        router.push('/admin/login')
      } else {
        router.push('/login')
      }
    } catch {
      clearUser()
      // Redirect to the matching login page
      if (role === 'STUDENT') {
        router.push('/student-login')
      } else if (role === 'TUTOR') {
        router.push('/tutor/login')
      } else if (role === 'ADMIN') {
        router.push('/admin/login')
      } else {
        router.push('/login')
      }
    }
  }

  const parentNavItems: NavItem[] = [
    { label: 'Overview', href: '/parent', icon: LayoutDashboard },
    { label: 'My Children', href: '/parent/students', icon: Users },
    { label: 'Enrollments', href: '/parent/enrollments', icon: BookOpen, category: 'ENROLLMENT' },
    { label: 'Live Sessions', href: '/parent/sessions', icon: Calendar, category: 'SESSIONS' },
    { label: 'Assignments', href: '/parent/assignments', icon: FileText, category: 'ASSIGNMENTS' },
    { label: 'Grades & Reports', href: '/parent/grades', icon: BarChart3, category: 'GRADES' },
    { label: 'Payments & Fees', href: '/parent/payments', icon: CreditCard, category: 'PAYMENTS' },
    { label: 'Pricing', href: '/parent/pricing', icon: DollarSign, category: 'PRICING' },
    { label: 'Messages', href: '/parent/messages', icon: MessageSquare, category: 'MESSAGES' },
    { label: 'Complaints', href: '/parent/complaints', icon: AlertCircle, category: 'COMPLAINTS' },
    { label: 'Settings', href: '/parent/settings', icon: Settings },
  ]

  const studentNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Class Schedule', href: '/student/schedule', icon: Calendar, category: 'SESSIONS' },
    { label: 'My Tutors', href: '/student/my-tutors', icon: Users },
    { label: 'My Assignments', href: '/student/assignments', icon: FileText, category: 'ASSIGNMENTS' },
    { label: 'Grades', href: '/student/grades', icon: BarChart3, category: 'GRADES' },
    { label: 'Performance', href: '/student/performance', icon: TrendingUp },
    { label: 'Progress Reports', href: '/student/progress-reports', icon: BookOpen },
    { label: 'Attendance', href: '/student/attendance', icon: UserCheck },
    { label: 'My Profile', href: '/student/profile', icon: GraduationCap },
    { label: 'Notifications', href: '/student/notifications', icon: Bell },
    { label: 'Settings', href: '/student/settings', icon: Settings },
  ]

  const tutorNavItems: NavItem[] = [
    { label: 'Application', href: '/tutor/application', icon: FileText },
    { label: 'Dashboard', href: '/tutor', icon: LayoutDashboard },
    { label: 'Students', href: '/tutor/students', icon: Users, category: 'USERS' },
    { label: 'Sessions', href: '/tutor/sessions', icon: Calendar, category: 'SESSIONS' },
    { label: 'Upcoming Classes', href: '/tutor/upcoming-classes', icon: UserCheck, category: 'SCHEDULE' },
    { label: 'Assignments', href: '/tutor/assignments', icon: FileText, category: 'ASSIGNMENTS' },
    { label: 'Grades', href: '/grades', icon: BarChart3, category: 'GRADES' },
    { label: 'Progress Reports', href: '/tutor/progress-reports', icon: BookOpen },
    { label: 'Messages', href: '/tutor/messages', icon: MessageSquare, category: 'MESSAGES' },
    { label: 'Notifications', href: '/tutor/notifications', icon: Bell },
    { label: 'Settings', href: '/tutor/settings', icon: Settings },
  ]

  const adminNavItems: NavItem[] = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Pending Tutors', href: '/admin/tutors/pending', icon: UserCheck, adminBadgeKey: 'pendingTutorApplications' },
    { label: 'All Tutors', href: '/admin/tutors', icon: Users, category: 'USERS', adminBadgeKey: 'unreadNewTutors' },
    { label: 'Parent Directory', href: '/admin/parents', icon: Users, category: 'USERS', adminBadgeKey: 'unreadNewParents' },
    { label: 'All Students', href: '/admin/students', icon: GraduationCap },
    { label: 'Unmatched Enrollments', href: '/admin/enrollments', icon: BookOpen, category: 'ENROLLMENT', adminBadgeKey: 'unmatchedPaidEnrollments' },
    { label: 'Sessions', href: '/admin/sessions', icon: Calendar, category: 'SESSIONS' },
    { label: 'Messages', href: '/admin/messages', icon: MessageSquare, category: 'MESSAGES', adminBadgeKey: 'unreadMessages' },
    { label: 'Complaints', href: '/admin/complaints', icon: AlertCircle, category: 'COMPLAINTS', adminBadgeKey: 'openComplaints' },
    { label: 'Transactions', href: '/admin/transactions', icon: CreditCard, category: 'PAYMENTS', adminBadgeKey: 'failedPayments' },
    { label: 'Grade Review', href: '/admin/grades', icon: BarChart3, category: 'GRADES', adminBadgeKey: 'pendingGrades' },
    { label: 'Class Schedule', href: '/admin/class-schedule', icon: Calendar, category: 'SCHEDULE', adminBadgeKey: 'unscheduledWithin24h' },
    { label: 'Change Requests', href: '/admin/change-requests', icon: FileText, adminBadgeKey: 'pendingChangeRequests' },
    { label: 'Subjects & Pricing', href: '/admin/subjects', icon: CreditCard },
    { label: 'Suspended Users', href: '/admin/suspended', icon: AlertCircle },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const navItems = role === 'PARENT' ? parentNavItems : role === 'STUDENT' ? studentNavItems : role === 'TUTOR' ? (user?.status === 'PENDING_VETTING' || user?.status === 'REJECTED' ? tutorNavItems.filter(item => item.href === '/tutor/application') : tutorNavItems) : adminNavItems

  const isActive = (href: string) => {
    if (href === '/parent' || href === '/student' || href === '/tutor' || href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : role.charAt(0) + role.slice(1).toLowerCase() + ' User')
  const userInitial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="xl:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border">
        <button
          ref={mobileOpenButtonRef}
          onClick={() => setMobileOpen(true)}
          className="-ml-2 grid size-11 place-items-center rounded-lg text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-primary"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-sidebar"
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>

        <Link href={role === 'PARENT' ? '/parent' : role === 'STUDENT' ? '/student' : role === 'TUTOR' ? '/tutor' : '/admin'} className="flex items-center">
          <BrandHeader />
        </Link>

        <Link
          href={`/${role.toLowerCase()}/notifications`}
          className="-mr-2 grid size-11 place-items-center rounded-lg text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-primary"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
        </Link>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 cursor-default border-0 bg-black/55 p-0 backdrop-blur-sm transition-opacity xl:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar Container */}
      <aside
        ref={sidebarRef}
        id="dashboard-sidebar"
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen ? true : undefined}
        aria-label={`${role.toLowerCase()} navigation menu`}
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col border-r-2 border-sidebar-border bg-sidebar shadow-[2px_0_12px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out xl:visible xl:translate-x-0 ${
          mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <Link href={role === 'PARENT' ? '/parent' : role === 'STUDENT' ? '/student' : role === 'TUTOR' ? '/tutor' : '/admin'} className="block">
            <BrandHeader variant="sidebar" />
          </Link>
          <button
            ref={drawerCloseButtonRef}
            onClick={() => setMobileOpen(false)}
            className="grid size-11 place-items-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground xl:hidden"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Portal Tag Badge */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-sidebar-accent border border-sidebar-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sidebar-primary animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-sidebar-foreground uppercase">
                {role === 'PARENT' ? 'Parent Portal' : role === 'STUDENT' ? 'Student Portal' : role === 'TUTOR' ? 'Tutor Portal' : 'Admin Portal'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-primary/15 text-sidebar-foreground font-medium border border-sidebar-primary/30">
              Active
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav role="navigation" aria-label={`${role.toLowerCase()} sections`} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex min-h-11 items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground border-l-4 border-sidebar-primary font-semibold pl-3'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active ? (
                  <ChevronRight className="w-4 h-4 text-sidebar-primary-foreground opacity-80" />
                ) : item.adminBadgeKey && badgeCounts[item.adminBadgeKey] !== undefined ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">
                    {formatBadgeCount(badgeCounts[item.adminBadgeKey])}
                  </span>
                ) : item.category && byCategory[item.category] !== undefined ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">
                    {byCategory[item.category] > 99 ? '99+' : byCategory[item.category]}
                  </span>
                ) : item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sidebar-accent text-sidebar-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Quick Links Card / Promo */}
        <div className="px-4 py-2">
          <div className="p-3 rounded-xl bg-sidebar-accent border border-sidebar-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sidebar-primary/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-sidebar-primary">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span className="text-sidebar-foreground">{role === 'PARENT' ? 'Parent Support' : role === 'STUDENT' ? 'Learning Hub' : role === 'TUTOR' ? 'Tutor Resources' : 'Admin Tools'}</span>
            </div>
            <p className="text-[11px] text-sidebar-foreground/70 leading-relaxed">
              {role === 'PARENT'
                ? 'Need tutor assistance or have scheduling questions? Message support anytime.'
                : role === 'STUDENT' ? 'Stay ahead of your coursework and submit assignments on time!' : role === 'TUTOR' ? 'Manage your students and schedule effectively.' : 'Manage platform users, settings, and enrollments.'}
            </p>
          </div>
        </div>

        {/* User Card & Logout Bottom Bar */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center justify-between p-2 rounded-xl bg-sidebar-accent border border-sidebar-border">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-sidebar-primary text-sidebar-primary-foreground font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate capitalize">
                  {displayName}
                </p>
                <p className="text-[10px] text-sidebar-foreground/70 font-medium tracking-wide">
                  {role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/${role.toLowerCase()}/notifications`}
                className="grid size-11 place-items-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-primary"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="grid size-11 place-items-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
