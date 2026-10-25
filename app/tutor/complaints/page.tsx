'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowRight } from 'lucide-react'

export default function TutorComplaintsPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-card border-brand-gold/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-brand-gold" />
            </div>
            <CardTitle className="text-2xl">Contact Admin</CardTitle>
            <CardDescription>
              Use the Messages page to contact the admin team for support and inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              If you have any concerns, questions, or issues, please message the admin team directly. 
              They will review your message and respond as soon as possible.
            </p>
            <Button
              onClick={() => router.push('/tutor/messages')}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-semibold gap-2"
            >
              Go to Messages
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
