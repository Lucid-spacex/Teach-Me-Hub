'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { getUser, clearUser } from '@/lib/auth'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  CreditCard,
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
} from 'lucide-react'

interface SidebarProps {
  role: 'PARENT' | 'STUDENT' | 'TUTOR' | 'ADMIN'
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUserState] = useState<{ email?: string; name?: string; role?: string } | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const currentUser = getUser()
    setUserState(currentUser)

    // Close mobile drawer on route change
    setMobileOpen(false)

    // Fetch unread notifications count
    const fetchUnread = async () => {
      try {
        const notifs = role === 'STUDENT' ? await api.getStudentNotifications() : await api.getNotifications()
        if (Array.isArray(notifs)) {
          const count = notifs.filter((n: any) => !n.read).length
          setUnreadNotifications(count)
        }
      } catch {
        // Silently ignore
      }
    }
    fetchUnread()
  }, [pathname, role])

  const handleLogout = async () => {
    try {
      await api.logout()
      clearUser()
      toast({
        title: 'Logged Out',
        description: 'You have been safely signed out.',
      })
      if (role === 'STUDENT') {
        router.push('/student-login')
      } else {
        router.push('/login')
      }
    } catch {
      clearUser()
      router.push(role === 'STUDENT' ? '/student-login' : '/login')
    }
  }

  const parentNavItems: NavItem[] = [
    { label: 'Overview', href: '/parent', icon: LayoutDashboard },
    { label: 'My Children', href: '/parent/students', icon: Users },
    { label: 'Enrollments', href: '/parent/enrollments', icon: BookOpen },
    { label: 'Live Sessions', href: '/parent/sessions', icon: Calendar },
    { label: 'Assignments', href: '/parent/assignments', icon: FileText },
    { label: 'Grades & Reports', href: '/parent/grades', icon: BarChart3 },
    { label: 'Payments & Fees', href: '/parent/payments', icon: CreditCard },
    { label: 'Messages', href: '/parent/messages', icon: MessageSquare },
    { label: 'Complaints', href: '/parent/complaints', icon: AlertCircle },
    { label: 'Settings', href: '/parent/settings', icon: Settings },
  ]

  const studentNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Class Schedule', href: '/student/schedule', icon: Calendar },
    { label: 'My Tutors', href: '/student/my-tutors', icon: Users },
    { label: 'My Assignments', href: '/student/assignments', icon: FileText },
    { label: 'Grades', href: '/student/grades', icon: BarChart3 },
    { label: 'Progress Reports', href: '/student/progress-reports', icon: BookOpen },
    { label: 'Attendance', href: '/student/attendance', icon: UserCheck },
    { label: 'Messages', href: '/student/messages', icon: MessageSquare },
    { label: 'My Profile', href: '/student/profile', icon: GraduationCap },
    { label: 'Settings', href: '/student/settings', icon: Settings },
  ]

  const tutorNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/tutor', icon: LayoutDashboard },
    { label: 'Students', href: '/tutor/students', icon: Users },
    { label: 'Sessions', href: '/tutor/sessions', icon: Calendar },
    { label: 'Assignments', href: '/tutor/assignments', icon: FileText },
    { label: 'Grades', href: '/tutor/grades', icon: BarChart3 },
    { label: 'Messages', href: '/tutor/messages', icon: MessageSquare },
    { label: 'Progress Reports', href: '/tutor/progress-reports', icon: BookOpen },
    { label: 'Notifications', href: '/tutor/notifications', icon: Bell },
    { label: 'Settings', href: '/tutor/settings', icon: Settings },
  ]

  const adminNavItems: NavItem[] = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Pending Tutors', href: '/admin/tutors/pending', icon: UserCheck },
    { label: 'All Tutors', href: '/admin/tutors', icon: Users },
    { label: 'Unmatched Enrollments', href: '/admin/enrollments', icon: BookOpen },
    { label: 'Pricing Tiers', href: '/admin/pricing', icon: CreditCard },
    { label: 'All Students', href: '/admin/students', icon: GraduationCap },
    { label: 'Suspended Users', href: '/admin/suspended', icon: AlertCircle },
    { label: 'Failed Payments', href: '/admin/payments/failed', icon: CreditCard },
    { label: 'Complaints', href: '/admin/complaints', icon: AlertCircle },
    { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const navItems = role === 'PARENT' ? parentNavItems : role === 'STUDENT' ? studentNavItems : role === 'TUTOR' ? tutorNavItems : adminNavItems

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
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-foreground/5"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link href={role === 'PARENT' ? '/parent' : role === 'STUDENT' ? '/student' : role === 'TUTOR' ? '/tutor' : '/admin'} className="flex items-center">
          <BrandHeader />
        </Link>

        <Link
          href={`/${role.toLowerCase()}/notifications`}
          className="p-2 -mr-2 text-foreground/80 hover:text-primary transition-colors relative rounded-lg hover:bg-foreground/5"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
          )}
        </Link>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-sidebar border-r-2 border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-[2px_0_12px_rgba(0,0,0,0.08)] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <Link href={role === 'PARENT' ? '/parent' : role === 'STUDENT' ? '/student' : role === 'TUTOR' ? '/tutor' : '/admin'} className="block">
            <BrandHeader />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-foreground/5 transition-colors"
          >
            <X className="w-5 h-5" />
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
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-primary/15 text-sidebar-primary font-medium border border-sidebar-primary/30">
              Active
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-sidebar-primary/20 via-sidebar-primary/10 to-transparent text-sidebar-primary border-l-4 border-sidebar-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] font-semibold pl-3'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {active ? (
                  <ChevronRight className="w-4 h-4 text-sidebar-primary opacity-80" />
                ) : item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sidebar-accent text-sidebar-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>

        {/* Quick Links Card / Promo */}
        <div className="px-4 py-2">
          <div className="p-3 rounded-xl bg-sidebar-accent border border-sidebar-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sidebar-primary/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-sidebar-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{role === 'PARENT' ? 'Parent Support' : role === 'STUDENT' ? 'Learning Hub' : role === 'TUTOR' ? 'Tutor Resources' : 'Admin Tools'}</span>
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
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sidebar-primary to-sidebar-primary/80 text-primary-foreground font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate capitalize">
                  {displayName}
                </p>
                <p className="text-[10px] text-sidebar-primary font-medium tracking-wide">
                  {role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/${role.toLowerCase()}/notifications`}
                className="p-1.5 text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-foreground/10 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Sign Out"
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
