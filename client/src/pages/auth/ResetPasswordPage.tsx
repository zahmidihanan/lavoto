import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { authApi } from '@/api/services'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
})
type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      authApi.resetPassword({ token, email, ...data }),
    onSuccess: () => {
      toast.success('Password reset successfully.')
      navigate('/login')
    },
    onError: () => toast.error('Invalid or expired reset link.'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New password</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose a strong password</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
        <FormField label="New Password" error={errors.password?.message} required>
          <Input type="password" placeholder="••••••••" {...register('password')} />
        </FormField>
        <FormField label="Confirm Password" error={errors.password_confirmation?.message} required>
          <Input type="password" placeholder="••••••••" {...register('password_confirmation')} />
        </FormField>
        <Button type="submit" className="w-full" loading={isPending}>
          Reset password
        </Button>
      </form>

      <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        ← Back to sign in
      </Link>
    </div>
  )
}
