'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Subject, GradeBandTier } from '@/lib/types'
import { DollarSign, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react'

const GRADE_BAND_LABELS: Record<GradeBandTier, string> = {
  PRESCHOOL_TO_G1: 'Preschool to Grade 1',
  G2_TO_G4: 'Grade 2 to Grade 4',
  G5_TO_G8: 'Grade 5 to Grade 8',
  G9_TO_G12: 'Grade 9 to Grade 12',
}

const GRADE_BAND_COLORS: Record<GradeBandTier, string> = {
  PRESCHOOL_TO_G1: 'bg-muted text-muted-foreground border-border',
  G2_TO_G4: 'bg-primary/10 text-foreground border-primary/30',
  G5_TO_G8: 'bg-primary/20 text-foreground border-primary/40',
  G9_TO_G12: 'bg-secondary text-foreground border-border',
}

export default function ParentPricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'PARENT') {
      router.push('/login')
      return
    }

    loadSubjects()
  }, [router])

  const loadSubjects = async () => {
    setLoading(true)
    try {
      const data = await api.getSubjects()
      setSubjects(data)
    } catch (err) {
      console.error('Failed to load subjects:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load subjects',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`
    }
    return `$${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto text-brand-gold" />
          <p className="text-sm text-muted-foreground">Loading pricing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/parent')}
          className="gap-2 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Pricing</h1>
          <p className="text-sm text-muted-foreground">View pricing for all available subjects and grade levels</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-brand-gold/10 border-brand-gold/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-brand-gold mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-white mb-1">Understanding Our Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Prices are displayed per grade band. When you enroll your child, the system will automatically
                calculate the price based on their grade level. Yearly prices are shown below, which are then
                divided according to your chosen billing frequency (weekly, monthly, or yearly).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Subjects Available</h3>
            <p className="text-sm text-muted-foreground">Check back later for available subjects and pricing</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-gold/20">
                      <BookOpen className="h-5 w-5 text-brand-gold" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{subject.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Category: {subject.category}
                      </p>
                    </div>
                  </div>
                  {subject.isActive ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-muted-foreground border border-gray-500/30">
                      Inactive
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {subject.subjectPrices && subject.subjectPrices.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-brand-gold" />
                      Pricing by Grade Band
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {subject.subjectPrices.map((price) => (
                        <div
                          key={`${subject.id}-${price.gradeBandTier}`}
                          className={`p-3 rounded-lg border ${GRADE_BAND_COLORS[price.gradeBandTier]}`}
                        >
                          <div className="text-xs font-medium mb-2">
                            {GRADE_BAND_LABELS[price.gradeBandTier]}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs opacity-70">NGN:</span>
                              <span className="text-sm font-bold">
                                {formatCurrency(parseFloat(price.yearlyPriceNGN), 'NGN')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs opacity-70">USD:</span>
                              <span className="text-sm font-bold">
                                {formatCurrency(parseFloat(price.yearlyPriceUSD), 'USD')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No pricing configured for this subject yet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
