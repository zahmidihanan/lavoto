import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  current_password: z.string().optional(),
  password: z.string().min(8).optional().or(z.literal('')),
  password_confirmation: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function EmployeeProfile() {
  const { user, setUser } = useAuthStore()
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U'

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  })

  const updateProfile = useMutation({
    mutationFn: (data: FormData) => authApi.updateProfile(data),
    onSuccess: (res) => {
      setUser(res.data.data)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Profile" description="Your employee profile" />

      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-primary mt-0.5">Employee</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Update Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
            <FormField label="Name" error={errors.name?.message} required>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <Separator />
            <p className="text-sm font-semibold">Change Password</p>
            <FormField label="Current Password" error={errors.current_password?.message}>
              <Input type="password" {...register('current_password')} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="New Password" error={errors.password?.message}>
                <Input type="password" {...register('password')} />
              </FormField>
              <FormField label="Confirm" error={errors.password_confirmation?.message}>
                <Input type="password" {...register('password_confirmation')} />
              </FormField>
            </div>
            <Button type="submit" loading={updateProfile.isPending}>Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
