'use client'

import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { getUser, clearUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Avatar } from '@/components/shared/Avatar'
import { LogOut, LayoutDashboard, GraduationCap, Shield } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const user = getUser()

  const handleLogout = async () => {
    await api.logout()
    router.push('/login')
  }

  if (!user) return null

  const getDashboardIcon = () => {
    switch (user.role) {
      case 'PARENT':
        return <LayoutDashboard className="h-4 w-4" />
      case 'TUTOR':
        return <GraduationCap className="h-4 w-4" />
      case 'ADMIN':
        return <Shield className="h-4 w-4" />
      default:
        return <LayoutDashboard className="h-4 w-4" />
    }
  }

  const getDashboardPath = () => {
    switch (user.role) {
      case 'PARENT':
        return '/parent'
      case 'TUTOR':
        return '/tutor'
      case 'ADMIN':
        return '/admin'
      default:
        return '/'
    }
  }

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push(getDashboardPath())}
              className="flex items-center gap-2 font-semibold hover:opacity-70 transition-opacity"
            >
              {getDashboardIcon()}
              <span>Smart Tutor</span>
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <Avatar
                fullName={user.fullName || 'User'}
                profilePictureUrl={user.profilePictureUrl}
                size="sm"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{user.fullName || 'User'}</span>
                <span>•</span>
                <span className="font-medium">{user.role || 'Guest'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
