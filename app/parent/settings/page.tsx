'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Loader2, Clock, Lock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { User } from '@/lib/types'
import { ProfilePictureUpload } from '@/components/shared/ProfilePictureUpload'
import { AppearanceSettings } from '@/components/shared/AppearanceSettings'

export default function ParentSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // Timezone state
  const [timezone, setTimezone] = useState('')
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Common timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Africa/Lagos',
    'Africa/Johannesburg',
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setTimezone(parsedUser.timezone || 'UTC')
      }
    }
    setLoading(false)
  }

  const handleTimezoneUpdate = async () => {
    setUpdating(true)
    try {
      await api.updateTimezone(timezone)
      
      // Update local storage
      if (user) {
        const updatedUser = { ...user, timezone }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
      
      toast({
        title: 'Timezone updated',
        description: 'Your timezone has been updated successfully',
      })
    } catch (error) {
      console.error('Failed to update timezone:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update timezone',
        variant: 'destructive',
      })
    } finally {
      setUpdating(false)
    }
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-zinc-400 font-medium">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences</p>
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
                fullName={user?.fullName || 'User'}
                onPictureChange={handleProfilePictureChange}
              />
            </CardContent>
          </Card>

          {/* Appearance */}
          <AppearanceSettings />

          {/* Timezone Settings */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-gold" />
                Timezone Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Set your preferred timezone for scheduling and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timezone" className="text-foreground/80">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-background border-input mt-2">
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleTimezoneUpdate}
                  disabled={updating}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Timezone'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

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
  )
}