import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { oauthService } from '@/services/oauthService'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage('OAuth authentication was cancelled or failed')
        toast.error('Authentication failed')
        return
      }

      if (!code || !state) {
        setStatus('error')
        setMessage('Invalid OAuth callback parameters')
        toast.error('Invalid authentication response')
        return
      }

      try {
        const response = await oauthService.handleCallback(code, state)
        
        if (response.data) {
          setUser(response.data)
          setToken(response.data.token)
          setStatus('success')
          setMessage('Authentication successful!')
          toast.success('Successfully authenticated!')
          
          // Redirect to the stored URL or dashboard
          const redirectUrl = localStorage.getItem('auth_redirect') || '/dashboard'
          localStorage.removeItem('auth_redirect')
          navigate(redirectUrl, { replace: true })
        } else {
          throw new Error('No user data received')
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Authentication failed')
        toast.error('Authentication failed')
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, setUser, setToken])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
              </div>
              <CardTitle>Completing authentication</CardTitle>
              <CardDescription>
                Please wait while we complete your authentication...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <CardTitle className="text-success-900">Authentication successful!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-neutral-600">
                Redirecting you to your dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-error-600" />
            </div>
            <CardTitle className="text-error-900">Authentication failed</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                There was an error during authentication. Please try again.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Back to login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
