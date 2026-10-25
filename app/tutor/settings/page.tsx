'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Settings, Lock, ArrowLeft, UserCheck, AlertCircle, Volume2, VolumeX } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { User, TutorAvailabilityStatus, TutorProfile } from '@/lib/types'
import { ProfilePictureUpload } from '@/components/shared/ProfilePictureUpload'
import { AppearanceSettings } from '@/components/shared/AppearanceSettings'
import { useNotifications } from '@/components/shared/NotificationProvider'

export default function TutorSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { soundEnabled, setSoundEnabled } = useNotifications()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Availability status state
  const [availabilityStatus, setAvailabilityStatus] = useState<TutorAvailabilityStatus>('AVAILABLE')
  const [maxStudents, setMaxStudents] = useState<number>(10)
  const [statusNote, setStatusNote] = useState('')
  const [updatingAvailability, setUpdatingAvailability] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
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

  const handleAvailabilityUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingAvailability(true)
    try {
      await api.updateTutorAvailabilityStatus({
        availabilityStatus,
        maxStudents,
        statusNote: statusNote || undefined,
      })

      toast({
        title: 'Availability Updated',
        description: 'Your availability status has been updated successfully',
      })

      if (availabilityStatus === 'UNAVAILABLE') {
        toast({
          title: 'Note',
          description: 'Setting your status to UNAVAILABLE will notify the admin team',
          variant: 'default',
        })
      }
    } catch (error) {
      console.error('Failed to update availability:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update availability',
        variant: 'destructive',
      })
    } finally {
      setUpdatingAvailability(false)
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
            onClick={() => router.push('/tutor')}
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
                fullName={user?.fullName || 'Tutor'}
                onPictureChange={handleProfilePictureChange}
              />
            </CardContent>
          </Card>

          {/* Appearance */}
          <AppearanceSettings />

          {/* Notification Settings */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-5 w-5 text-brand-gold" /> : <VolumeX className="h-5 w-5 text-brand-gold" />}
                Notification Sound
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Play a sound when new notifications arrive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">
                    {soundEnabled ? 'Sound enabled' : 'Sound disabled'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sound plays when you receive new notifications
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                >
                  {soundEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Availability Status */}
          <Card className="bg-card border-brand-gold/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-brand-gold" />
                Availability Status
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your availability for new student assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAvailabilityUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="availabilityStatus" className="text-foreground/80">Status</Label>
                  <Select value={availabilityStatus} onValueChange={(value) => setAvailabilityStatus(value as TutorAvailabilityStatus)}>
                    <SelectTrigger id="availabilityStatus" className="bg-background border-input mt-2">
                      <SelectValue placeholder="Select your availability status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available - Accepting new students</SelectItem>
                      <SelectItem value="LIMITED">Limited - Some capacity for new students</SelectItem>
                      <SelectItem value="UNAVAILABLE">Unavailable - Not accepting new students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxStudents" className="text-foreground/80">Maximum Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="50"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(parseInt(e.target.value) || 10)}
                    className="bg-background border-input mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">The maximum number of students you can teach at once</p>
                </div>
                <div>
                  <Label htmlFor="statusNote" className="text-foreground/80">Status Note (Optional)</Label>
                  <Textarea
                    id="statusNote"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about your availability (e.g., 'Available weekends only')"
                    className="bg-background border-input mt-2 min-h-[80px]"
                  />
                </div>
                {availabilityStatus === 'UNAVAILABLE' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Setting your status to UNAVAILABLE will notify the admin team. They may contact you to discuss your availability.
                      </span>
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={updatingAvailability}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                >
                  {updatingAvailability ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Availability'
                  )}
                </Button>
              </form>
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
    </div>
  )
}
