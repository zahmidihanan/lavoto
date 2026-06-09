import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { authApi } from '@/api/services'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => authApi.forgotPassword(data.email),
    onSuccess: () => setSent(true),
    onError: () => toast.error('Failed to send reset link.'),
  })

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-muted-foreground text-sm">
          We sent a password reset link to your email address.
        </p>
        <Link to="/login" className="block text-primary text-sm font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
        <FormField label="Email" error={errors.email?.message} required>
          <Input type="email" placeholder="you@example.com" {...register('email')} />
        </FormField>
        <Button type="submit" className="w-full" loading={isPending}>
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        ← Back to sign in
      </Link>
    </div>
  )
}
