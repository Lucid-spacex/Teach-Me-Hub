'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { QuizQuestion } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2, CheckCircle, XCircle, Clock, Edit } from 'lucide-react'

interface QuizQuestionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentId: string
  assignmentTitle: string
  timeLimitMinutes?: number | null
  onSuccess: () => void
}

export function QuizQuestionsModal({ open, onOpenChange, assignmentId, assignmentTitle, timeLimitMinutes, onSuccess }: QuizQuestionsModalProps) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [editingTimer, setEditingTimer] = useState(false)
  const [timerValue, setTimerValue] = useState(timeLimitMinutes?.toString() || '30')
  const [savingTimer, setSavingTimer] = useState(false)

  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    points: 10,
    orderIndex: 0,
  })

  useEffect(() => {
    if (open && assignmentId) {
      loadQuestions()
      setTimerValue(timeLimitMinutes?.toString() || '30')
    }
  }, [open, assignmentId, timeLimitMinutes])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const data = await api.getQuizQuestions(assignmentId)
      setQuestions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load quiz questions:', err)
      toast({
        title: 'Error',
        description: 'Failed to load quiz questions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingQuestion(true)

    try {
      const questionData = {
        questionText: newQuestion.questionText,
        options: newQuestion.options,
        correctOptionIndex: newQuestion.correctIndex,
        points: newQuestion.points,
        orderIndex: questions.length,
      }

      await api.createQuizQuestion(assignmentId, questionData)

      toast({
        title: 'Success',
        description: 'Question added successfully',
      })

      // Reset form
      setNewQuestion({
        questionText: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        points: 10,
        orderIndex: 0,
      })

      // Reload questions
      await loadQuestions()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add question',
        variant: 'destructive',
      })
    } finally {
      setAddingQuestion(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      // Note: The API doesn't have a delete endpoint, so we'll just reload
      // In a real implementation, you'd want to add a delete endpoint
      toast({
        title: 'Not Implemented',
        description: 'Question deletion is not yet available',
        variant: 'destructive',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      })
    }
  }

  const handleSaveTimer = async () => {
    setSavingTimer(true)
    try {
      await api.updateAssignment(assignmentId, {
        timeLimitMinutes: parseInt(timerValue) || 30,
      })
      toast({
        title: 'Timer Updated',
        description: 'Quiz timer has been updated successfully',
      })
      setEditingTimer(false)
      onSuccess()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update timer',
        variant: 'destructive',
      })
    } finally {
      setSavingTimer(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Manage Quiz Questions - ${assignmentTitle}`}
      description="Add and manage quiz questions for this test assignment"
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="default"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Timer Settings */}
        <div className="bg-brand-subtle/50 border border-brand-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-gold" />
              Timer Settings
            </h3>
            {!editingTimer && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingTimer(true)}
                className="text-brand-gold hover:text-brand-goldLight"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          {editingTimer ? (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="timerInput">Time per Question (seconds)</Label>
                <Input
                  id="timerInput"
                  type="number"
                  min="10"
                  max="300"
                  value={timerValue}
                  onChange={(e) => setTimerValue(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingTimer(false)
                    setTimerValue(timeLimitMinutes?.toString() || '30')
                  }}
                  disabled={savingTimer}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveTimer}
                  disabled={savingTimer}
                  className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                >
                  {savingTimer ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Time per question: <span className="font-semibold text-foreground">{timeLimitMinutes || 30} seconds</span>
            </p>
          )}
        </div>

        {/* Add Question Form */}
        <div className="bg-brand-subtle/50 border border-brand-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-gold" />
            Add New Question
          </h3>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={newQuestion.questionText}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                placeholder="Enter your question here..."
                rows={3}
                required
                className="bg-background border-input"
              />
            </div>

            <div>
              <Label>Options *</Label>
              <div className="space-y-2 mt-2">
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        newQuestion.correctIndex === index ? 'bg-brand-gold text-brand-dark' : 'bg-muted text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options]
                          newOptions[index] = e.target.value
                          setNewQuestion({ ...newQuestion, options: newOptions })
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                        className="bg-background border-input"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewQuestion({ ...newQuestion, correctIndex: index })}
                      className={`h-8 w-8 p-0 ${newQuestion.correctIndex === index ? 'bg-brand-gold text-brand-dark' : 'text-muted-foreground'}`}
                      title="Mark as correct answer"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Click the checkmark to mark the correct answer</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                  required
                  className="bg-background border-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={addingQuestion}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {addingQuestion ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adding...
                </>
              ) : (
                'Add Question'
              )}
            </Button>
          </form>
        </div>

        {/* Existing Questions */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-gold" />
            Existing Questions ({questions.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-brand-border rounded-lg">
              <p className="text-muted-foreground">No questions added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => {
                const correctIdx = question.correctIndex ?? question.correctOptionIndex ?? -1
                return (
                <div key={question.id} className="bg-card border border-brand-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-gold/20 text-brand-gold text-xs font-bold px-2 py-1 rounded">
                        Q{index + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">{question.points} points</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-foreground font-medium mb-3">{question.questionText}</p>

                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded ${
                          correctIdx === optIndex
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-muted/50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          correctIdx === optIndex ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <span className={`text-sm ${
                          correctIdx === optIndex ? 'text-green-400' : 'text-muted-foreground'
                        }`}>
                          {option}
                        </span>
                        {correctIdx === optIndex && (
                          <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
