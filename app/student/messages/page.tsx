'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, AlertCircle, User, Home } from 'lucide-react'

export default function StudentMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'STUDENT') {
      router.push('/student-login')
      return
    }
  }, [router])

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/student')}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">Messages</h1>
            <p className="text-sm text-gray-400">Communication guidelines</p>
          </div>
        </div>
      </div>

      {/* Information Card */}
      <Card className="bg-card border-brand-gold/30 max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <CardTitle className="text-white">Messaging Not Available</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            As of October 12, 2026, students can no longer send messages through the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-brand-dark/30 p-4 rounded-lg border border-brand-gold/10">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-gold" />
              How to Communicate
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-1">•</span>
                <span>Ask your parent to contact your tutor on your behalf</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-1">•</span>
                <span>Parents can message Admin for support or questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-gold mt-1">•</span>
                <span>Session details and assignments are available in your Schedule and Assignments pages</span>
              </li>
            </ul>
          </div>

          <div className="bg-brand-gold/10 p-4 rounded-lg border border-brand-gold/20">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-gold" />
              Why This Change?
            </h3>
            <p className="text-sm text-gray-300">
              This change ensures all student-tutor communication flows through parents for proper oversight and safety. 
              Your parent can view your assigned tutors and session details, and can coordinate directly with tutors or admin.
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => router.push('/student/my-tutors')}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              View My Assigned Tutors
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
