import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/shared/FormField'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  company_name: z.string().min(2, 'Company name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => authApi.register(data),
    onSuccess: (res) => {
      const { token, user } = res.data.data
      setAuth(token, user)
      toast.success('Account created! Welcome to Lavoto.')
      navigate('/admin', { replace: true })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Registration failed.')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-muted-foreground text-sm mt-1">Start your free Lavoto trial</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Your Name" error={errors.name?.message} required>
            <Input placeholder="John Doe" {...register('name')} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <Input type="tel" placeholder="+1 555 000" {...register('phone')} />
          </FormField>
        </div>
        <FormField label="Email" error={errors.email?.message} required>
          <Input type="email" placeholder="you@company.com" {...register('email')} />
        </FormField>
        <FormField label="Company Name" error={errors.company_name?.message} required>
          <Input placeholder="Acme Car Wash" {...register('company_name')} />
        </FormField>
        <FormField label="Password" error={errors.password?.message} required>
          <Input type="password" placeholder="••••••••" {...register('password')} />
        </FormField>
        <FormField label="Confirm Password" error={errors.password_confirmation?.message} required>
          <Input type="password" placeholder="••••••••" {...register('password_confirmation')} />
        </FormField>

        <Button type="submit" className="w-full" loading={isPending}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
