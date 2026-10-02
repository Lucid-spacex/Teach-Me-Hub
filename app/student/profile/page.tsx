'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { api } from '@/lib/api'
import { StudentProfile } from '@/lib/types'
import { User, GraduationCap, Key, Settings, ArrowLeft, Copy, Check, Clock, School } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function StudentProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

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
    } catch (err) {
      console.error('Failed to load profile:', err)
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

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student')}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Student Profile</h1>
              <p className="text-sm text-gray-400">Your student identification and learning profile</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/student/settings')}
            className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings & PIN
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Identity Card */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-brand-gold/20 text-brand-gold">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white font-serif">{profile.fullName}</CardTitle>
                    <p className="text-sm text-brand-gold font-medium mt-0.5">Enrolled Student</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-brand-dark/70 border border-brand-gold/20">
                    <span className="text-xs text-gray-400 block mb-1">Student Login Code</span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-mono font-bold text-brand-gold tracking-wider">
                        {profile.studentCode}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyCode}
                        className="text-gray-300 hover:text-white"
                      >
                        {copiedCode ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-brand-dark/70 border border-brand-gold/20">
                    <span className="text-xs text-gray-400 block mb-1">Academic Grade Band</span>
                    <span className="text-xl font-semibold text-white">
                      {profile.actualGrade}
                    </span>
                  </div>

                  {profile.school && (
                    <div className="p-4 rounded-lg bg-brand-dark/70 border border-brand-gold/20">
                      <span className="text-xs text-gray-400 block mb-1">School</span>
                      <span className="text-base text-gray-200">
                        {profile.school}
                      </span>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-brand-dark/70 border border-brand-gold/20">
                    <span className="text-xs text-gray-400 block mb-1">Enrolled Since</span>
                    <span className="text-base text-gray-200">
                      {new Date(profile.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-gold/15 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Need to update your login PIN or timezone?
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/student/settings')}
                    className="border-brand-gold text-brand-gold hover:bg-brand-gold/10"
                  >
                    <Key className="h-4 w-4 mr-1.5" />
                    Manage Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-card border-brand-gold/30 text-center py-12 text-gray-400">
            Could not load student profile.
          </Card>
        )}
      </div>
  )
}
