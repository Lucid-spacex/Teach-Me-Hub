'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, XCircle, FileText, Bell, GraduationCap, ArrowRight } from 'lucide-react'

interface TutorStatusScreenProps {
  status: 'PENDING_VETTING' | 'REJECTED'
}

export function TutorStatusScreen({ status }: TutorStatusScreenProps) {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }
  }, [router])

  const isPending = status === 'PENDING_VETTING'
  const isRejected = status === 'REJECTED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-card flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-brand-gold/30 bg-card">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center">
            {isPending ? (
              <div className="bg-amber-500/20 p-4 rounded-full text-amber-400">
                <Clock className="h-8 w-8" />
              </div>
            ) : (
              <div className="bg-red-500/20 p-4 rounded-full text-red-400">
                <XCircle className="h-8 w-8" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {isPending ? 'Application Under Review' : 'Application Not Approved'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-2">
              {isPending
                ? 'Your tutor application is currently being reviewed by our admin team. This process typically takes 1-3 business days.'
                : 'Unfortunately, your tutor application was not approved at this time.'}
            </p>
            {isRejected && (
              <p className="text-sm text-gray-400">
                If you believe this is an error or would like to reapply, please contact our support team.
              </p>
            )}
          </div>

          {/* Available Actions */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-brand-gold mb-3">Available Actions:</div>

            <Button
              onClick={() => router.push('/tutor/application')}
              className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold h-12 rounded-xl flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isPending ? 'View Application' : 'Reapply'}
            </Button>

            <Button
              onClick={() => router.push('/tutor/notifications')}
              variant="outline"
              className="w-full border-brand-gold/30 text-brand-gold hover:bg-brand-gold/10 font-semibold h-12 rounded-xl flex items-center justify-center gap-2"
            >
              <Bell className="h-4 w-4" />
              View Notifications
            </Button>

            <Button
              onClick={() => router.push('/register/tutor')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 font-semibold h-12 rounded-xl flex items-center justify-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Browse Public Subjects
            </Button>
          </div>

          {/* Navigation Restriction Notice */}
          <div className="p-4 rounded-lg bg-brand-dark/40 border border-brand-gold/10">
            <p className="text-xs text-gray-400 text-center">
              <span className="text-brand-gold font-medium">Navigation Restricted:</span> Access to tutor dashboard and student management is limited until your application is approved.
            </p>
          </div>

          {isPending && (
            <div className="text-center">
              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                className="text-gray-400 hover:text-white text-sm"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
