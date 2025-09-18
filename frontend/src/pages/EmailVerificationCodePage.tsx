import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { VerificationCodeInput } from '@/components/forms/VerificationCodeInput'
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'

export const EmailVerificationCodePage = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'input' | 'success' | 'error' | 'loading'>('input')
  const [message, setMessage] = useState('Enter the verification code sent to your email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleCodeComplete = async (code: string) => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    try {
      // For now, we'll use the token-based verification
      // In a real app, you'd have a separate endpoint for code verification
      const response = await authService.verifyEmail(code, email)
      setStatus('success')
      setMessage('Email verified successfully!')
      toast.success('Email verified successfully!')
    } catch (error: any) {
      setStatus('error')
      setMessage(error.response?.data?.error || 'Invalid verification code')
      toast.error('Invalid verification code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    try {
      await authService.resendVerification(email)
      toast.success('Verification code sent!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend code')
    }
  }

  const handleContinue = () => {
    navigate('/dashboard')
  }

  const handleTryAgain = () => {
    setStatus('input')
    setMessage('Enter the verification code sent to your email')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Verifying your email</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-900">Email verified!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Verification failed</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex space-x-2">
              <Button onClick={handleTryAgain} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => navigate('/login')} className="flex-1">
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <VerificationCodeInput
                length={6}
                onComplete={handleCodeComplete}
                onError={(error) => toast.error(error)}
                disabled={isSubmitting || !email}
              />
            </div>

            <div className="flex flex-col space-y-2 w-full">
              <Button
                onClick={handleResendCode}
                variant="outline"
                disabled={!email || isSubmitting}
                className="w-full"
              >
                Resend Code
              </Button>
              
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

