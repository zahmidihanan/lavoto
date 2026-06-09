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
import { authApi } from '@/api/services'
import { useAuthStore } from '@/stores/auth.store'
import { useThemeStore } from '@/stores/theme.store'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  current_password: z.string().optional(),
  password: z.string().min(8).optional(),
  password_confirmation: z.string().optional(),
})
type ProfileData = z.infer<typeof profileSchema>

export function AdminSettings() {
  const { user, setUser } = useAuthStore()
  const { theme, toggle } = useThemeStore()

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  })

  const updateProfile = useMutation({
    mutationFn: (data: ProfileData) => authApi.updateProfile(data),
    onSuccess: (res) => {
      setUser(res.data.data)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
            <FormField label="Name" error={errors.name?.message} required>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <Separator />
            <p className="text-sm font-medium">Change Password</p>
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

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggle} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
