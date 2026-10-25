'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { ScoredItem, ScoredItemType } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/shared/Modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { 
  FileText, 
  Trophy, 
  Star, 
  UserCheck, 
  Edit, 
  Trash2, 
  Plus,
  Loader2,
  Clock
} from 'lucide-react'

interface ScoredItemsTabProps {
  studentId: string
  enrollmentId?: string
  refreshTrigger?: number
}

export function ScoredItemsTab({ studentId, enrollmentId, refreshTrigger }: ScoredItemsTabProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<ScoredItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<ScoredItemType | 'ALL'>('ALL')
  const [showUnattachedOnly, setShowUnattachedOnly] = useState(false)
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ScoredItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    type: 'TEST' as ScoredItemType,
    title: '',
    maxScore: 100,
    score: null as number | null,
    comment: '',
  })

  useEffect(() => {
    loadItems()
  }, [studentId, refreshTrigger])

  const loadItems = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (filterType !== 'ALL') {
        filters.type = filterType
      }
      if (showUnattachedOnly) {
        filters.notAttachedToGrade = true
      }
      const data = await api.getScoredItems(studentId, filters)
      setItems(data)
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || formData.maxScore <= 0 || !enrollmentId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setCreating(true)
    try {
      await api.createScoredItem(studentId, {
        enrollmentId,
        type: formData.type,
        title: formData.title,
        maxScore: formData.maxScore,
        score: formData.score ?? undefined,
        comment: formData.comment,
      })
      toast({
        title: 'Success',
        description: 'Scored item created successfully',
      })
      setCreateModalOpen(false)
      setFormData({ type: 'TEST', title: '', maxScore: 100, score: null, comment: '' })
      loadItems()
    } catch (err) {
      console.error('Failed to create scored item:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create scored item',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    setEditing(true)
    try {
      await api.updateScoredItem(selectedItem.id, {
        score: formData.score ?? undefined,
        comment: formData.comment,
      })
      toast({
        title: 'Success',
        description: 'Scored item updated successfully',
      })
      setEditModalOpen(false)
      setSelectedItem(null)
      loadItems()
    } catch (err) {
      console.error('Failed to update scored item:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update scored item',
        variant: 'destructive',
      })
    } finally {
      setEditing(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this scored item? This action cannot be undone.')) {
      return
    }

    setDeleting(itemId)
    try {
      await api.deleteScoredItem(itemId)
      toast({
        title: 'Success',
        description: 'Scored item deleted successfully',
      })
      loadItems()
    } catch (err) {
      console.error('Failed to delete scored item:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete scored item',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  const openEditModal = (item: ScoredItem) => {
    setSelectedItem(item)
    setFormData({
      type: item.type,
      title: item.title,
      maxScore: item.maxScore,
      score: item.tutorScore ?? null,
      comment: item.comment || '',
    })
    setEditModalOpen(true)
  }

  const getItemIcon = (type: ScoredItemType) => {
    switch (type) {
      case 'QUIZ_ATTEMPT':
        return <Trophy className="h-4 w-4" />
      case 'ASSIGNMENT_SUBMISSION':
        return <FileText className="h-4 w-4" />
      case 'TEST':
        return <Star className="h-4 w-4" />
      case 'PARTICIPATION':
        return <UserCheck className="h-4 w-4" />
    }
  }

  const getItemColor = (type: ScoredItemType) => {
    switch (type) {
      case 'QUIZ_ATTEMPT':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/30'
      case 'ASSIGNMENT_SUBMISSION':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30'
      case 'TEST':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/30'
      case 'PARTICIPATION':
        return 'bg-green-500/10 text-green-500 border-green-500/30'
    }
  }

  const isReadOnly = (item: ScoredItem) => {
    return !!item.attachedToGradeId
  }

  const filteredItems = items.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false
    if (showUnattachedOnly && item.attachedToGradeId) return false
    return true
  })

  return (
    <>
      <Card className="bg-card border-brand-gold/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-brand-gold" />
              Scored Items ({filteredItems.length})
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark font-bold gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="typeFilter" className="text-sm">Type:</Label>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <SelectTrigger id="typeFilter" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="QUIZ_ATTEMPT">Quiz Attempts</SelectItem>
                  <SelectItem value="ASSIGNMENT_SUBMISSION">Assignments</SelectItem>
                  <SelectItem value="TEST">Tests</SelectItem>
                  <SelectItem value="PARTICIPATION">Participation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="unattachedOnly"
                checked={showUnattachedOnly}
                onChange={(e) => setShowUnattachedOnly(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="unattachedOnly" className="text-sm cursor-pointer">
                Not yet in a grade
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" className="text-brand-gold" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-3">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-medium">No scored items found</p>
              <p className="text-xs">Quizzes, assignments, tests, and participation will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    isReadOnly(item) 
                      ? 'border-border/50 bg-muted/30' 
                      : 'border-brand-gold/25 bg-brand-gold/[0.02]'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getItemColor(item.type)}>
                        {getItemIcon(item.type)}
                        <span className="ml-1">{item.type.replace('_', ' ')}</span>
                      </Badge>
                      {item.attachedToGradeId && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          In Grade
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Max: {item.maxScore}</span>
                      {item.autoScore !== null && item.autoScore !== undefined && (
                        <span className="text-purple-500">Auto: {item.autoScore}</span>
                      )}
                      {item.tutorScore !== null && item.tutorScore !== undefined && (
                        <span className="text-brand-gold font-medium">Tutor: {item.tutorScore}</span>
                      )}
                    </div>
                    {item.comment && (
                      <p className="text-xs text-muted-foreground italic">{item.comment}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isReadOnly(item) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="gap-1 text-xs h-8"
                        >
                          <Edit className="h-3 w-3" />
                          {item.type === 'ASSIGNMENT_SUBMISSION' ? 'Score' : 'Adjust'}
                        </Button>
                        {item.type !== 'QUIZ_ATTEMPT' && item.type !== 'ASSIGNMENT_SUBMISSION' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deleting === item.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </>
                    )}
                    {isReadOnly(item) && (
                      <span className="text-xs text-muted-foreground italic">
                        Read-only (attached to grade)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Modal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Add Scored Item"
        description="Add a test or participation item for this student"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" form="create-form" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Create
            </Button>
          </div>
        }
      >
        <form id="create-form" onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEST">Test</SelectItem>
                <SelectItem value="PARTICIPATION">Participation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Mid-term Test, Class Participation"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxScore">Maximum Score *</Label>
            <Input
              id="maxScore"
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Score (optional)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max={formData.maxScore}
              value={formData.score || ''}
              onChange={(e) => setFormData({ ...formData, score: e.target.value ? Number(e.target.value) : null })}
              placeholder={`0 - ${formData.maxScore}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Notes about this scored item..."
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        title={selectedItem?.type === 'ASSIGNMENT_SUBMISSION' ? 'Score Assignment' : 'Adjust Score'}
        description="Update the tutor score and add comments"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={editing}>
              Cancel
            </Button>
            <Button type="submit" form="edit-form" disabled={editing}>
              {editing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </div>
        }
      >
        <form id="edit-form" onSubmit={handleEdit} className="space-y-4">
          <div className="space-y-2">
            <Label>Item</Label>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="font-medium text-foreground">{selectedItem?.title}</p>
              <p className="text-sm text-muted-foreground">Max Score: {selectedItem?.maxScore}</p>
              {selectedItem?.autoScore !== null && selectedItem?.autoScore !== undefined && (
                <p className="text-sm text-purple-500">Auto Score: {selectedItem.autoScore}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editScore">Score *</Label>
            <Input
              id="editScore"
              type="number"
              min="0"
              max={selectedItem?.maxScore}
              value={formData.score || ''}
              onChange={(e) => setFormData({ ...formData, score: e.target.value ? Number(e.target.value) : null })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editComment">Comment</Label>
            <Textarea
              id="editComment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Notes about this score..."
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
