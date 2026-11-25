'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Payment } from '@/lib/types'

function PaymentCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error' | 'processing'>('loading')
  const [payment, setPayment] = useState<Payment | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const reference = searchParams.get('reference')
    
    if (!reference) {
      setStatus('error')
      setErrorMessage('No payment reference found in URL')
      return
    }

    verifyPayment(reference, 0)
  }, [searchParams])

  // The verify endpoint response shape is not fully documented in ENDPOINT.md,
  // so read the status tolerantly from possible locations and normalize it.
  const extractStatus = (data: any): string | undefined => {
    const raw =
      data?.status ??
      data?.data?.status ??
      data?.payment?.status ??
      data?.verification?.status
    return typeof raw === 'string' ? raw.toUpperCase() : undefined
  }

  const normalizeStatus = (raw?: string): 'SUCCESS' | 'FAILED' | 'PENDING' | 'OTHER' => {
    if (!raw) return 'OTHER'
    if (raw === 'SUCCESS' || raw === 'SUCCESSFUL' || raw === 'COMPLETED') return 'SUCCESS'
    if (raw === 'FAILED' || raw === 'ABANDONED' || raw === 'REVERSED') return 'FAILED'
    if (raw === 'PENDING' || raw === 'ONGOING' || raw === 'QUEUED' || raw === 'PENDING_PAYMENT') return 'PENDING'
    return 'OTHER'
  }

  const MAX_PENDING_POLLS = 15 // ~30 seconds at 2s intervals

  const verifyPayment = async (reference: string, attempt: number) => {
    try {
      // Call backend to verify payment status using the reference
      const data = await api.verifyPayment(reference)
      const normalized = normalizeStatus(extractStatus(data))

      if (normalized === 'SUCCESS') {
        setStatus('success')
        setPayment(data as Payment)
      } else if (normalized === 'FAILED') {
        setStatus('failed')
        setPayment(data as Payment)
      } else if (normalized === 'PENDING') {
        if (attempt >= MAX_PENDING_POLLS) {
          // Backend hasn't confirmed yet — don't spin forever.
          setStatus('processing')
          return
        }
        // Payment is still pending, poll again after a delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        await verifyPayment(reference, attempt + 1)
      } else {
        setStatus('error')
        setErrorMessage(`Unexpected payment status: ${extractStatus(data) ?? 'unknown'}`)
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      // A single transient failure shouldn't kill verification — retry a few times
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await verifyPayment(reference, attempt + 1)
        return
      }
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to verify payment status')
    }
  }

  const handleReturnToDashboard = () => {
    router.push('/parent')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">Verifying your payment...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="bg-green-500/20 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Payment Successful!</h3>
                <p className="text-muted-foreground">
                  Your payment has been processed successfully. Your enrollment(s) are now active.
                </p>
                {payment && (
                  <div className="mt-4 p-4 bg-brand-dark/50 rounded-lg text-left">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="text-white font-medium">
                          {payment.currency === 'USD' ? '$' : '₦'}{payment.amount}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Reference:</span>
                        <span className="text-brand-gold font-mono text-xs">
                          {payment.providerReference || payment.reference || payment.id}
                        </span>
                      </div>
                      {payment.enrollment?.subject && (
                        <div className="flex justify-between mt-1">
                          <span>Enrollment:</span>
                          <span className="text-white">
                            {payment.enrollment.subject.name}
                          </span>
                        </div>
                      )}
                      {payment.subjects && payment.subjects.length > 0 && (
                        <div className="flex justify-between mt-1">
                          <span>Covers:</span>
                          <span className="text-white">
                            {payment.subjects.map((s) => s.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleReturnToDashboard}
                className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark py-2 px-4 rounded-lg font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="bg-red-500/20 p-4 rounded-full">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Payment Failed</h3>
                <p className="text-muted-foreground">
                  Your payment could not be processed. Please try again or contact support.
                </p>
              </div>
              <button
                onClick={handleReturnToDashboard}
                className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark py-2 px-4 rounded-lg font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="bg-blue-500/20 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-blue-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Payment Processing</h3>
                <p className="text-muted-foreground">
                  Your payment was submitted and is being confirmed. This can take a short while —
                  check your Payments page for the latest status.
                </p>
              </div>
              <button
                onClick={() => router.push('/parent/payments')}
                className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark py-2 px-4 rounded-lg font-medium"
              >
                View Payments
              </button>
              <button
                onClick={handleReturnToDashboard}
                className="w-full text-sm text-muted-foreground hover:text-white py-2"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="bg-yellow-500/20 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Payment Verification Error</h3>
                <p className="text-muted-foreground">
                  {errorMessage || 'Unable to verify payment status. Please contact support.'}
                </p>
              </div>
              <button
                onClick={handleReturnToDashboard}
                className="w-full bg-brand-gold hover:bg-brand-goldLight text-brand-dark py-2 px-4 rounded-lg font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}