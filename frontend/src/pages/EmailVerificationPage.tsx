import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const response = await authService.verifyEmailByLink(token, email)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')
        toast.success('Email verified successfully!')
      } catch (error: any) {
        setStatus('error')
        setMessage(error.response?.data?.error || 'Failed to verify email')
        toast.error('Failed to verify email')
      }
    }

    verifyEmail()
  }, [token, email])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
              </div>
              <CardTitle>Verifying your email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
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
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <CardTitle className="text-success-900">Email verified!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <p className="text-sm text-neutral-600">
                  Your email has been successfully verified. You can now access all features of your account.
                </p>
                <div className="flex flex-col space-y-3">
                  <Link to="/login">
                    <Button className="w-full">
                      Continue to login
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" className="w-full">
                      Go to homepage
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-error-600" />
            </div>
            <CardTitle className="text-error-900">Verification failed</CardTitle>
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                The verification link may be invalid or expired. Please request a new verification email.
              </p>
              <div className="flex flex-col space-y-3">
                <Link to="/login">
                  <Button className="w-full">
                    Back to login
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Go to homepage
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
