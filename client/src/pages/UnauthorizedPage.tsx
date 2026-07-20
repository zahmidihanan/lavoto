import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { isAuthenticated, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium text-muted-foreground">Access denied.</p>
      {isAuthenticated && (
        <Button variant="outline" onClick={handleLogout}>
          Sign out
        </Button>
      )}
    </div>
  )
}
