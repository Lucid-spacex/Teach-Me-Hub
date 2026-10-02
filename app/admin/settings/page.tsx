'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Loader2, Settings, Lock, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { User } from '@/lib/types'
import { ProfilePictureUpload } from '@/components/shared/ProfilePictureUpload'
import { AppearanceSettings } from '@/components/shared/AppearanceSettings'

export default function AdminSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadUserData()
  }, [router])

  const loadUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    }
    setLoading(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }

    setChangingPassword(true)
    try {
      await api.changePassword({
        currentPassword,
        newPassword,
      })

      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully',
      })

      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Failed to change password:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleProfilePictureChange = (url: string | null) => {
    if (user) {
      const updatedUser = { ...user, profilePictureUrl: url }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark">
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gold mx-auto mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="gap-2 text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-gold" />
                Profile Picture
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePictureUpload
                currentPictureUrl={user?.profilePictureUrl}
                fullName={user?.fullName || 'Admin'}
                onPictureChange={handleProfilePictureChange}
              />
            </CardContent>
          </Card>

          {/* Appearance */}
          <AppearanceSettings />

          {/* Password Change */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-gold" />
                Change Password
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-foreground/80">Current Password</Label>
                  <PasswordInput
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="bg-background border-input mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-foreground/80">New Password</Label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background border-input mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm New Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background border-input mt-2"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-gold" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-sm">Full Name</Label>
                  <p className="text-foreground font-medium">{user?.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <p className="text-foreground font-medium">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Role</Label>
                  <p className="text-foreground font-medium">{user?.role}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Account Status</Label>
                  <p className="text-foreground font-medium">{user?.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
