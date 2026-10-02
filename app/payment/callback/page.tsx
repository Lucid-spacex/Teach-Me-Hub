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
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading')
  const [payment, setPayment] = useState<Payment | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const reference = searchParams.get('reference')
    
    if (!reference) {
      setStatus('error')
      setErrorMessage('No payment reference found in URL')
      return
    }

    verifyPayment(reference)
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      // Call backend to verify payment status using the reference
      const payment = await api.verifyPayment(reference)
      
      if (payment.status === 'SUCCESS') {
        setStatus('success')
        setPayment(payment)
      } else if (payment.status === 'FAILED') {
        setStatus('failed')
      } else if (payment.status === 'PENDING') {
        // Payment is still pending, poll again after a delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        await verifyPayment(reference)
      } else {
        setStatus('error')
        setErrorMessage(`Unexpected payment status: ${payment.status}`)
      }
    } catch (error) {
      console.error('Payment verification error:', error)
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
              <p className="text-gray-400">Verifying your payment...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="bg-green-500/20 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Payment Successful!</h3>
                <p className="text-gray-400">
                  Your payment has been processed successfully. Your enrollment(s) are now active.
                </p>
                {payment && (
                  <div className="mt-4 p-4 bg-brand-dark/50 rounded-lg text-left">
                    <div className="text-sm text-gray-400">
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
                <p className="text-gray-400">
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

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="bg-yellow-500/20 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-yellow-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Payment Verification Error</h3>
                <p className="text-gray-400">
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