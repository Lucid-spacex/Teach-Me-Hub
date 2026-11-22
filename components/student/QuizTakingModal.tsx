'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { QuizQuestion, QuizAttempt } from '@/lib/types'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Clock, ChevronRight, AlertCircle } from 'lucide-react'

interface QuizTakingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignmentId: string
  assignmentTitle: string
  timeLimitMinutes?: number | null
  onSuccess: () => void
}

export function QuizTakingModal({ open, onOpenChange, assignmentId, assignmentTitle, timeLimitMinutes, onSuccess }: QuizTakingModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open && assignmentId) {
      startQuiz()
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [open, assignmentId])

  const startQuiz = async () => {
    setLoading(true)
    try {
      // Start the quiz attempt
      const attemptData = await api.startQuiz(assignmentId)
      setAttempt(attemptData)

      // Load questions
      const questionsData = await api.getQuizQuestions(assignmentId)
      setQuestions(Array.isArray(questionsData) ? questionsData : [])

      // Set timer (use assignment's time limit or default to 30 seconds)
      const timePerQuestion = timeLimitMinutes || 30
      setTimeLeft(timePerQuestion)
      startTimer()

      setCurrentQuestionIndex(0)
      setSelectedOption(null)
    } catch (err) {
      console.error('Failed to start quiz:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to start quiz',
        variant: 'destructive',
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    if (timerInterval) clearInterval(timerInterval)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          // Auto-submit if time runs out
          if (selectedOption !== null) {
            handleSubmitAnswer()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setTimerInterval(interval)
  }

  const handleSubmitAnswer = async () => {
    if (!attempt || selectedOption === null) return

    try {
      const timePerQuestion = timeLimitMinutes || 30
      await api.submitQuizAnswer(attempt.id, {
        questionId: questions[currentQuestionIndex].id,
        selectedOptionIndex: selectedOption,
        timeTakenSeconds: Math.max(0, timePerQuestion - timeLeft),
      })

      // Move to next question immediately without showing feedback
      handleNextQuestion()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to submit answer',
        variant: 'destructive',
      })
    }
  }

  const handleNextQuestion = () => {
    setSelectedOption(null)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      const timePerQuestion = timeLimitMinutes || 30
      setTimeLeft(timePerQuestion)
      startTimer()
    } else {
      // Complete the quiz
      completeQuiz()
    }
  }

  const completeQuiz = async () => {
    if (!attempt) return

    try {
      await api.completeQuiz(attempt.id)
      toast({
        title: 'Quiz Submitted',
        description: 'Quiz submitted. Your tutor will review it.',
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to complete quiz',
        variant: 'destructive',
      })
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (loading) {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={assignmentTitle}
        description="Loading quiz..."
        footer={<Button onClick={() => onOpenChange(false)}>Close</Button>}
      >
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    )
  }

  if (questions.length === 0) {
    return (
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={assignmentTitle}
        description="No questions available"
        footer={<Button onClick={() => onOpenChange(false)}>Close</Button>}
      >
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">This quiz has no questions yet.</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={assignmentTitle}
      description={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
      footer={
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Progress: {Math.round(progress)}%
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Timer */}
        <div className="flex items-center justify-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            timeLeft <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-brand-gold/20 text-brand-gold'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">{timeLeft}s</span>
          </div>
        </div>

        {/* Question */}
        <Card className="bg-card border-brand-gold/30">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">
              {currentQuestion.questionText}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {currentQuestion.points} points
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedOption === index
                      ? 'border-brand-gold bg-brand-gold/10'
                      : 'border-brand-border hover:border-brand-gold/50'
                  } cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      selectedOption === index
                        ? 'bg-brand-gold text-brand-dark'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-foreground">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  )
}
