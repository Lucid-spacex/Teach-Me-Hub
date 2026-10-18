'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Modal } from '@/components/shared/Modal'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { Subject, SubjectPrice, GradeBandTier } from '@/lib/types'
import { BookOpen, Plus, Edit, Trash2, DollarSign, AlertCircle } from 'lucide-react'

const GRADE_BANDS: { value: GradeBandTier; label: string }[] = [
  { value: 'PRESCHOOL_TO_G1', label: 'Preschool to Grade 1' },
  { value: 'G2_TO_G4', label: 'Grade 2 to Grade 4' },
  { value: 'G5_TO_G8', label: 'Grade 5 to Grade 8' },
  { value: 'G9_TO_G12', label: 'Grade 9 to Grade 12' },
]

const CATEGORIES = [
  { value: 'CORE', label: 'Core Subjects' },
  { value: 'ENRICHMENT', label: 'Enrichment' },
  { value: 'TEST_PREP', label: 'Test Preparation' },
]

export default function AdminSubjectsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'CORE' as 'CORE' | 'ENRICHMENT' | 'TEST_PREP',
    prices: GRADE_BANDS.map(band => ({
      gradeBandTier: band.value,
      yearlyPriceNGN: 0,
      yearlyPriceUSD: 0,
    })),
  })

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadSubjects()
  }, [router])

  const loadSubjects = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminSubjects()
      setSubjects(data)
    } catch (err) {
      console.error('Failed to load subjects:', err)
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Transform data to match backend expectations
      const payload = {
        name: formData.name,
        category: formData.category,
        prices: formData.prices.map(price => ({
          gradeBandTier: price.gradeBandTier,
          yearlyPriceNGN: price.yearlyPriceNGN,
          yearlyPriceUSD: price.yearlyPriceUSD,
        })),
      }
      await api.createSubject(payload)
      toast({
        title: 'Subject Created',
        description: 'The subject has been created successfully',
      })
      setModalOpen(false)
      resetForm()
      loadSubjects()
    } catch (err) {
      console.error('Failed to create subject:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create subject',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubject) return

    setSaving(true)
    try {
      // Transform data to match backend expectations
      const payload = {
        name: formData.name || undefined,
        category: formData.category ? formData.category.toUpperCase() as 'CORE' | 'ENRICHMENT' | 'TEST_PREP' : undefined,
      }
      await api.updateSubject(editingSubject.id, payload)
      toast({
        title: 'Subject Updated',
        description: 'The subject has been updated successfully',
      })
      setModalOpen(false)
      resetForm()
      loadSubjects()
    } catch (err) {
      console.error('Failed to update subject:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update subject',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return

    try {
      await api.deleteSubject(subjectId)
      toast({
        title: 'Subject Deleted',
        description: 'The subject has been deleted successfully',
      })
      loadSubjects()
    } catch (err) {
      console.error('Failed to delete subject:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete subject',
        variant: 'destructive',
      })
    }
  }

  const handleUpdatePrice = async (subjectId: string, gradeBand: GradeBandTier, yearlyPriceNGN: number, yearlyPriceUSD: number) => {
    try {
      await api.updateSubjectPricing(subjectId, { gradeBandTier: gradeBand, yearlyPriceNGN, yearlyPriceUSD })
      toast({
        title: 'Price Updated',
        description: 'The price has been updated successfully',
      })
      loadSubjects()
    } catch (err) {
      console.error('Failed to update price:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update price',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'CORE',
      prices: GRADE_BANDS.map(band => ({
        gradeBandTier: band.value,
        yearlyPriceNGN: 0,
        yearlyPriceUSD: 0,
      })),
    })
    setEditingSubject(null)
  }

  const openCreateModal = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      category: subject.category as 'CORE' | 'ENRICHMENT' | 'TEST_PREP',
      prices: subject.prices || GRADE_BANDS.map(band => ({
        gradeBandTier: band.value,
        yearlyPriceNGN: 0,
        yearlyPriceUSD: 0,
      })),
    })
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Subjects & Pricing</h1>
          <p className="text-sm text-muted-foreground">Manage subjects and their per-grade-band pricing</p>
        </div>
        <Button onClick={openCreateModal} className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Subjects List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : subjects.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Subjects Found</h3>
            <p className="text-sm text-gray-400">Add subjects to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject) => (
            <Card key={subject.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{subject.name}</CardTitle>
                    <p className="text-sm text-gray-400">{subject.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(subject)}
                      className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-brand-gold" />
                    Pricing by Grade Band
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {GRADE_BANDS.map((band) => {
                      const price = (subject.prices || subject.subjectPrices)?.find(p => p.gradeBandTier === band.value)
                      return (
                        <div key={band.value} className="p-3 bg-brand-dark/30 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">{band.label}</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={Number(price?.yearlyPriceNGN) || 0}
                                onChange={(e) => handleUpdatePrice(
                                  subject.id,
                                  band.value,
                                  parseInt(e.target.value) || 0,
                                  Number(price?.yearlyPriceUSD) || 0
                                )}
                                className="bg-background border-input text-white text-sm h-8"
                                placeholder="NGN"
                              />
                              <span className="text-xs text-gray-400">₦</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={Number(price?.yearlyPriceUSD) || 0}
                                onChange={(e) => handleUpdatePrice(
                                  subject.id,
                                  band.value,
                                  Number(price?.yearlyPriceNGN) || 0,
                                  parseInt(e.target.value) || 0
                                )}
                                className="bg-background border-input text-white text-sm h-8"
                                placeholder="USD"
                              />
                              <span className="text-xs text-gray-400">$</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        description={editingSubject ? 'Update subject details' : 'Add a new subject with pricing'}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
            >
              Cancel
            </Button>
            <Button
              onClick={editingSubject ? handleUpdateSubject : handleCreateSubject}
              disabled={saving}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {saving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {editingSubject ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <form onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Subject Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-brand-dark/30 border-brand-gold/30 text-white mt-2"
              placeholder="e.g., Mathematics"
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-300">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as 'CORE' | 'ENRICHMENT' | 'TEST_PREP' })}
              required
            >
              <SelectTrigger className="bg-brand-dark/30 border-brand-gold/30 text-white mt-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!editingSubject && (
            <div className="space-y-3">
              <Label className="text-gray-300">Pricing by Grade Band *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GRADE_BANDS.map((band) => (
                  <div key={band.value} className="p-3 bg-brand-dark/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">{band.label}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`ngn-${band.value}`} className="text-xs text-gray-400">Price (NGN)</Label>
                        <Input
                          id={`ngn-${band.value}`}
                          type="number"
                          value={formData.prices.find(p => p.gradeBandTier === band.value)?.yearlyPriceNGN || 0}
                          onChange={(e) => {
                            const newPrices = formData.prices.map(p =>
                              p.gradeBandTier === band.value
                                ? { ...p, yearlyPriceNGN: parseInt(e.target.value) || 0 }
                                : p
                            )
                            setFormData({ ...formData, prices: newPrices })
                          }}
                          required
                          min="0"
                          className="bg-background border-input text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`usd-${band.value}`} className="text-xs text-gray-400">Price (USD)</Label>
                        <Input
                          id={`usd-${band.value}`}
                          type="number"
                          value={formData.prices.find(p => p.gradeBandTier === band.value)?.yearlyPriceUSD || 0}
                          onChange={(e) => {
                            const newPrices = formData.prices.map(p =>
                              p.gradeBandTier === band.value
                                ? { ...p, yearlyPriceUSD: parseInt(e.target.value) || 0 }
                                : p
                            )
                            setFormData({ ...formData, prices: newPrices })
                          }}
                          required
                          min="0"
                          className="bg-background border-input text-white mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
