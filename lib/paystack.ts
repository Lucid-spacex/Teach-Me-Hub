export interface PaystackCheckoutOptions {
  accessCode?: string
  authorizationUrl?: string
  reference?: string
  onSuccess?: (reference: string) => void
  onCancel?: () => void
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key?: string
        access_code?: string
        callback?: (response: { reference: string }) => void
        onClose?: () => void
      }) => {
        openIframe: () => void
      }
    }
  }
}

function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.PaystackPop) return resolve(true)

    const existingScript = document.getElementById('paystack-inline-js')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true))
      existingScript.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.id = 'paystack-inline-js'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openPaystackCheckout(options: PaystackCheckoutOptions): Promise<void> {
  const { accessCode, authorizationUrl, onSuccess, onCancel } = options

  // Paystack Inline popup needs BOTH:
  //   - access_code  (identifies the transaction)
  //   - key          (identifies the merchant — required by /checkout/request_inline)
  // Without the public key the popup always returns 400. Only attempt popup
  // when a valid key is configured; otherwise go straight to redirect.
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  if (accessCode && publicKey && typeof window !== 'undefined') {
    try {
      const scriptLoaded = await loadPaystackScript()
      if (scriptLoaded && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          access_code: accessCode,
          callback: (response: { reference: string }) => {
            if (onSuccess) {
              onSuccess(response.reference)
            } else {
              window.location.href = `/payment/callback?reference=${encodeURIComponent(response.reference)}`
            }
          },
          onClose: () => {
            if (onCancel) {
              onCancel()
            }
          },
        })
        handler.openIframe()
        return
      }
    } catch (err) {
      console.warn('Paystack popup failed, falling back to redirect:', err)
    }
  }

  // Fallback: redirect to Paystack-hosted checkout page.
  // This always works regardless of public key configuration and gives
  // the same payment experience on a Paystack-hosted page.
  if (authorizationUrl && typeof window !== 'undefined') {
    window.location.href = authorizationUrl
    return
  }

  throw new Error('No valid payment access code or authorization URL provided.')
}
