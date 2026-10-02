'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { StudentProfile } from '@/lib/types'
import { Settings, Lock, Clock, ArrowLeft, Key, User, Check, Copy } from 'lucide-react'
import { ProfilePictureUpload } from '@/components/shared/ProfilePictureUpload'
import { AppearanceSettings } from '@/components/shared/AppearanceSettings'

export default function StudentSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

  // Timezone state
  const [timezone, setTimezone] = useState('')
  const [updatingTimezone, setUpdatingTimezone] = useState(false)

  // PIN state
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [updatingPin, setUpdatingPin] = useState(false)

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
    'Asia/Dubai',
    'Africa/Lagos',
    'Africa/Johannesburg',
  ]

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }

    loadProfile()
  }, [router])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await api.getStudentProfile()
      setProfile(data)
      setTimezone(data.timezone || 'UTC')
    } catch (err) {
      console.error('Failed to load student profile:', err)
      const cachedUser = typeof window !== 'undefined' ? getUser() : null
      if (cachedUser) {
        setTimezone((cachedUser as any).timezone || 'UTC')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (!profile?.studentCode) return
    navigator.clipboard.writeText(profile.studentCode)
    setCopiedCode(true)
    toast({
      title: 'Copied to Clipboard',
      description: `Student Code ${profile.studentCode} copied.`,
    })
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleUpdateTimezone = async () => {
    setUpdatingTimezone(true)
    try {
      await api.updateTimezone(timezone)
      toast({
        title: 'Timezone Updated',
        description: 'Your preferred timezone has been updated.',
      })
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Could not update timezone',
        variant: 'destructive',
      })
    } finally {
      setUpdatingTimezone(false)
    }
  }

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/^\d{6}$/.test(newPin)) {
      toast({
        title: 'Invalid PIN',
        description: 'New PIN must be exactly 6 numeric digits.',
        variant: 'destructive',
      })
      return
    }

    if (newPin !== confirmPin) {
      toast({
        title: 'PINs Do Not Match',
        description: 'New PIN and Confirmation PIN must be identical.',
        variant: 'destructive',
      })
      return
    }

    setUpdatingPin(true)
    try {
      // Use auth password/pin change endpoint
      await api.changePassword({
        currentPassword: currentPin,
        newPassword: newPin,
      })
      toast({
        title: 'PIN Changed',
        description: 'Your 6-digit student login PIN has been updated successfully.',
      })
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    } catch (err) {
      toast({
        title: 'PIN Change Failed',
        description: err instanceof Error ? err.message : 'Could not change PIN. Please verify your current PIN.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingPin(false)
    }
  }

  const handleProfilePictureChange = (url: string | null) => {
    if (profile) {
      const updatedProfile = { ...profile, profilePictureUrl: url }
      setProfile(updatedProfile)
    }
  }

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/student')}
            className="gap-2 text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Student Profile & Settings</h1>
            <p className="text-sm text-muted-foreground">Manage login PIN, timezone, and student code</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture Card */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-gold" />
                  Profile Picture
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Upload a profile picture to personalize your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfilePictureUpload
                  currentPictureUrl={profile?.profilePictureUrl}
                  fullName={profile?.fullName || 'Student'}
                  onPictureChange={handleProfilePictureChange}
                />
              </CardContent>
            </Card>

            {/* Student Code Card */}
            {profile && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-gold" />
                    Student Credentials
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Your unique identifier required for student portal login
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-brand-dark/70 border border-brand-gold/20">
                      <span className="text-xs text-muted-foreground block mb-1">Student Name</span>
                      <p className="text-lg font-bold text-foreground">{profile.fullName}</p>
                      <p className="text-xs text-brand-gold mt-1">Grade: {profile.actualGrade}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-brand-dark/70 border border-brand-gold/20 flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Student Code</span>
                        <p className="text-2xl font-mono font-extrabold text-brand-gold tracking-widest">
                          {profile.studentCode}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                        className="mt-3 border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 self-start"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1.5" />
                            Copy Student Code
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timezone Settings */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-gold" />
                  Timezone Preference
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ensures all your tutoring session start times match your local clock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-md space-y-2">
                  <Label htmlFor="timezone" className="text-foreground/80">Preferred Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-background border-input text-foreground">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpdateTimezone}
                  disabled={updatingTimezone}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold"
                >
                  {updatingTimezone ? 'Updating...' : 'Save Timezone'}
                </Button>
              </CardContent>
            </Card>

            {/* Change PIN Form */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-foreground text-lg flex items-center gap-2">
                  <Key className="h-5 w-5 text-brand-gold" />
                  Change 6-Digit PIN
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update the 6-digit PIN used to log in to this student portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePin} className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPin" className="text-foreground/80">Current PIN</Label>
                    <PasswordInput
                      id="currentPin"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="••••••"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                      className="bg-background border-input text-foreground font-mono tracking-widest text-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPin" className="text-foreground/80">New 6-Digit PIN</Label>
                    <PasswordInput
                      id="newPin"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="••••••"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="bg-background border-input text-foreground font-mono tracking-widest text-lg"
                      required
                    />
                    <p className="text-xs text-gray-500">Must be exactly 6 digits (numbers only).</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPin" className="text-foreground/80">Confirm New PIN</Label>
                    <PasswordInput
                      id="confirmPin"
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="••••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="bg-background border-input text-foreground font-mono tracking-widest text-lg"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updatingPin || newPin.length !== 6 || confirmPin.length !== 6}
                    className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold mt-2"
                  >
                    {updatingPin ? 'Updating PIN...' : 'Update PIN'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
  )
}
