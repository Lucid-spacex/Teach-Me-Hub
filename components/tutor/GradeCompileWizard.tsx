'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { CompiledGrade, ScoredItem, TutorStudent, GradeComponentType, GradePreviewResponse } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertTriangle,
  Calculator,
  BookOpen,
  Trophy,
  Star,
  UserCheck,
  Clock
} from 'lucide-react'

interface GradeCompileWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editingGrade?: CompiledGrade | null
}

const STEPS = ['Select Items', 'Set Weights', 'Preview', 'Review'] as const

const COMPONENT_LABELS: Record<GradeComponentType, string> = {
  QUIZ: 'Quizzes',
  ASSIGNMENT: 'Assignments',
  TEST: 'Tests',
  PARTICIPATION: 'Participation',
  ATTENDANCE: 'Attendance',
}

const COMPONENT_ICONS: Record<GradeComponentType, any> = {
  QUIZ: Trophy,
  ASSIGNMENT: BookOpen,
  TEST: Star,
  PARTICIPATION: UserCheck,
  ATTENDANCE: Clock,
}

export function GradeCompileWizard({ open, onOpenChange, onSuccess, editingGrade }: GradeCompileWizardProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<TutorStudent[]>([])
  const [scoredItems, setScoredItems] = useState<ScoredItem[]>([])
  const [preview, setPreview] = useState<GradePreviewResponse | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    enrollmentId: '',
    period: '',
    selectedItemIds: [] as string[],
    componentWeights: {
      QUIZ: 0,
      ASSIGNMENT: 0,
      TEST: 0,
      PARTICIPATION: 0,
      ATTENDANCE: 0,
    } as Record<GradeComponentType, number>,
    finalScore: null as number | null,
    overrideReason: '',
    tutorComment: '',
    attachments: [] as string[],
  })

  useEffect(() => {
    if (open) {
      loadInitialData()
      if (editingGrade) {
        // Pre-fill from existing grade
        setFormData({
          enrollmentId: editingGrade.enrollmentId,
          period: editingGrade.period,
          selectedItemIds: editingGrade.frozenSnapshotItems.map(item => item.id),
          componentWeights: editingGrade.components.reduce((acc, comp) => {
            acc[comp.type] = comp.weight
            return acc
          }, {} as Record<GradeComponentType, number>),
          finalScore: editingGrade.finalScore ?? null,
          overrideReason: editingGrade.overrideReason || '',
          tutorComment: editingGrade.tutorComment || '',
          attachments: editingGrade.attachments || [],
        })
        setCurrentStep(2) // Skip to preview
      } else {
        resetForm()
      }
    }
  }, [open, editingGrade])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [studentsData] = await Promise.all([
        api.getTutorStudents().catch(() => []),
      ])
      setStudents(studentsData)
    } catch (err) {
      console.error('Failed to load initial data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadScoredItems = async (enrollmentId: string) => {
    setLoading(true)
    try {
      const enrollment = students.find(s => s.enrollment?.id === enrollmentId)
      if (enrollment?.student) {
        const items = await api.getScoredItems(enrollment.student.id, { notInGrade: true, enrollmentId })
        setScoredItems(items)
      }
    } catch (err) {
      console.error('Failed to load scored items:', err)
      toast({
        title: 'Error',
        description: 'Failed to load scored items',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      enrollmentId: '',
      period: '',
      selectedItemIds: [],
      componentWeights: {
        QUIZ: 0,
        ASSIGNMENT: 0,
        TEST: 0,
        PARTICIPATION: 0,
        ATTENDANCE: 0,
      },
      finalScore: null,
      overrideReason: '',
      tutorComment: '',
      attachments: [],
    })
    setPreview(null)
    setCurrentStep(0)
  }

  const totalWeight = Object.values(formData.componentWeights).reduce((sum, w) => sum + w, 0)

  const handleEnrollmentChange = (enrollmentId: string) => {
    setFormData({ ...formData, enrollmentId, selectedItemIds: [] })
    loadScoredItems(enrollmentId)
  }

  const handleItemToggle = (itemId: string) => {
    setFormData({
      ...formData,
      selectedItemIds: formData.selectedItemIds.includes(itemId)
        ? formData.selectedItemIds.filter(id => id !== itemId)
        : [...formData.selectedItemIds, itemId],
    })
  }

  const handlePreview = async () => {
    if (formData.selectedItemIds.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one scored item',
        variant: 'destructive',
      })
      return
    }

    if (totalWeight !== 100) {
      toast({
        title: 'Validation Error',
        description: 'Component weights must total exactly 100%',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const previewData = await api.previewCompiledGrade({
        enrollmentId: formData.enrollmentId,
        period: formData.period,
        itemIds: formData.selectedItemIds,
        componentWeights: formData.componentWeights,
      })
      setPreview(previewData)
      setCurrentStep(2)
    } catch (err) {
      console.error('Failed to preview grade:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to preview grade',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (asDraft: boolean) => {
    if (!preview && !editingGrade) {
      toast({
        title: 'Error',
        description: 'Please preview the grade first',
        variant: 'destructive',
      })
      return
    }

    if (formData.finalScore !== null && !formData.overrideReason) {
      toast({
        title: 'Validation Error',
        description: 'Override reason is required when setting a final score',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      if (editingGrade) {
        await api.updateCompiledGradeDraft(editingGrade.id, {
          enrollmentId: formData.enrollmentId,
          period: formData.period,
          itemIds: formData.selectedItemIds,
          componentWeights: formData.componentWeights,
          finalScore: formData.finalScore,
          overrideReason: formData.overrideReason || undefined,
          tutorComment: formData.tutorComment || undefined,
          attachments: formData.attachments,
        })
        toast({
          title: 'Grade Updated',
          description: 'Grade draft updated successfully',
        })
      } else {
        const grade = await api.createCompiledGrade({
          enrollmentId: formData.enrollmentId,
          period: formData.period,
          itemIds: formData.selectedItemIds,
          componentWeights: formData.componentWeights,
          finalScore: formData.finalScore,
          overrideReason: formData.overrideReason || undefined,
          tutorComment: formData.tutorComment || undefined,
          attachments: formData.attachments,
        })
        
        if (asDraft) {
          toast({
            title: 'Draft Saved',
            description: 'Grade draft saved successfully',
          })
        } else {
          await api.submitCompiledGrade(grade.id)
          toast({
            title: 'Grade Submitted',
            description: 'Grade submitted for admin approval',
          })
        }
      }
      
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      console.error('Failed to save grade:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save grade',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getEnrollmentItems = () => {
    return scoredItems.filter(item => 
      formData.selectedItemIds.includes(item.id)
    )
  }

  const getItemsByComponent = (type: GradeComponentType) => {
    const typeMap: Record<string, GradeComponentType> = {
      'QUIZ_ATTEMPT': 'QUIZ',
      'ASSIGNMENT_SUBMISSION': 'ASSIGNMENT',
      'TEST': 'TEST',
      'PARTICIPATION': 'PARTICIPATION',
    }
    return getEnrollmentItems().filter(item => typeMap[item.type] === type)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editingGrade ? 'Edit Grade' : 'Compile New Grade'}
      description="Create a period-based grade by selecting scored items and setting component weights"
      className="sm:max-w-[800px]"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === currentStep
                      ? 'bg-brand-gold text-brand-dark'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep > 0) setCurrentStep(currentStep - 1)
                else onOpenChange(false)
              }}
              disabled={loading}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            {currentStep === STEPS.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                >
                  {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Submit to Admin
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  if (currentStep === 1) handlePreview()
                  else setCurrentStep(currentStep + 1)
                }}
                disabled={loading || (currentStep === 1 && totalWeight !== 100)}
              >
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {currentStep === 1 ? 'Preview' : 'Next'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {loading && currentStep === 0 ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Select Items */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollment">Enrollment *</Label>
                  <Select
                    value={formData.enrollmentId}
                    onValueChange={handleEnrollmentChange}
                    disabled={!!editingGrade}
                  >
                    <SelectTrigger id="enrollment">
                      <SelectValue placeholder="Select enrollment" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.enrollment?.id} value={s.enrollment?.id || ''}>
                          {s.student.fullName} - {s.enrollment?.subject?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period *</Label>
                  <Input
                    id="period"
                    placeholder="e.g., Term 1 2024, Q1 2024"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    disabled={!!editingGrade}
                  />
                </div>
              </div>

              {formData.enrollmentId && (
                <div className="space-y-3">
                  <Label>Select Scored Items to Include</Label>
                  {scoredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No scored items available for this enrollment
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {scoredItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50"
                        >
                          <Checkbox
                            id={item.id}
                            checked={formData.selectedItemIds.includes(item.id)}
                            onCheckedChange={() => handleItemToggle(item.id)}
                          />
                          <div className="flex-1">
                            <label htmlFor={item.id} className="font-medium text-sm cursor-pointer">
                              {item.title}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {item.type.replace('_', ' ')} • Max: {item.maxScore}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Set Weights */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-brand-gold/10 border border-brand-gold/30">
                <span className="font-medium">Total Weight</span>
                <span className={`text-2xl font-bold ${totalWeight === 100 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalWeight}%
                </span>
              </div>
              {totalWeight !== 100 && (
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Weights must total exactly 100%</span>
                </div>
              )}

              <div className="space-y-3">
                {Object.entries(COMPONENT_LABELS).map(([type, label]) => {
                  const Icon = COMPONENT_ICONS[type as GradeComponentType]
                  const itemCount = getItemsByComponent(type as GradeComponentType).length
                  return (
                    <div key={type} className="flex items-center gap-4 p-3 rounded-lg border border-border/50">
                      <Icon className="h-5 w-5 text-brand-gold" />
                      <div className="flex-1">
                        <Label className="font-medium">{label}</Label>
                        <p className="text-xs text-muted-foreground">{itemCount} items selected</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.componentWeights[type as GradeComponentType]}
                          onChange={(e) => setFormData({
                            ...formData,
                            componentWeights: {
                              ...formData.componentWeights,
                              [type]: Number(e.target.value)
                            }
                          })}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {currentStep === 2 && preview && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-brand-gold" />
                    Computed Score Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Computed Score</p>
                      <p className="text-3xl font-bold text-foreground">{preview.computedScore.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Attendance Rate</p>
                      <p className="text-3xl font-bold text-foreground">{preview.attendanceRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Component Breakdown</Label>
                    {preview.components.map(comp => (
                      <div key={comp.type} className="p-3 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{COMPONENT_LABELS[comp.type]}</span>
                          <Badge variant="outline">{comp.weight}%</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {comp.itemCount} items • {comp.componentPercentage.toFixed(1)}% contribution
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="finalScore">Final Score Override (optional)</Label>
                <Input
                  id="finalScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.finalScore || ''}
                  onChange={(e) => setFormData({ ...formData, finalScore: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Leave blank to use computed score"
                />
              </div>

              {formData.finalScore !== null && (
                <div className="space-y-2">
                  <Label htmlFor="overrideReason">Override Reason *</Label>
                  <Textarea
                    id="overrideReason"
                    value={formData.overrideReason}
                    onChange={(e) => setFormData({ ...formData, overrideReason: e.target.value })}
                    placeholder="Explain why you're overriding the computed score..."
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tutorComment">Tutor Comment (optional)</Label>
                <Textarea
                  id="tutorComment"
                  value={formData.tutorComment}
                  onChange={(e) => setFormData({ ...formData, tutorComment: e.target.value })}
                  placeholder="Add any additional notes about this grade..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments (optional)</Label>
                <Input
                  id="attachments"
                  type="text"
                  value={formData.attachments?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    attachments: e.target.value ? e.target.value.split(',').map(s => s.trim()) : [] 
                  })}
                  placeholder="Enter attachment URLs separated by commas"
                />
                <p className="text-xs text-muted-foreground">
                  Enter Google Drive or other file URLs, separated by commas
                </p>
              </div>

              {preview && (
                <div className="p-4 rounded-lg bg-brand-gold/10 border border-brand-gold/30">
                  <p className="text-sm">
                    <span className="font-medium">Computed Score:</span> {preview.computedScore.toFixed(1)}%
                    {formData.finalScore !== null && (
                      <span className="ml-2">
                        → <span className="font-medium">Final Score:</span> {formData.finalScore}%
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
