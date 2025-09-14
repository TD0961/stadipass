import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from '@/hooks/useForm'
import { validationSchemas } from '@/utils/validation'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/forms/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface ForgotPasswordFormData {
  email: string
}

export const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { values, errors, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm<ForgotPasswordFormData>({
    initialValues: {
      email: '',
    },
    validationSchema: {
      email: validationSchemas.login.email,
    },
    onSubmit: async (formData) => {
      try {
        await authService.requestPasswordReset(formData.email)
        toast.success('Password reset link sent to your email')
        setIsSubmitted(true)
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to send reset link')
      }
    },
  })

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-success-600" />
              </div>
              <CardTitle className="text-success-900">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to <strong>{values.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 text-center">
                If you don't see the email in your inbox, check your spam folder.
              </p>
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Try another email
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                    Back to login
                  </Button>
                </Link>
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
        <div className="text-center">
          <h1 className="heading-2">Forgot your password?</h1>
          <p className="text-body mt-2">
            No worries, we'll send you reset instructions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email address"
                type="email"
                value={values.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                leftIcon={<Mail className="h-5 w-5" />}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
