import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { useGetMeQuery } from '../features/auth/authApiSlice'
import { updateUser } from '../features/auth/authSlice'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute() {
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)

  // Verify token & fetch current authenticated user profile from backend
  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
    refetchOnMountOrChange: false,
  })

  useEffect(() => {
    if (data?.data) {
      dispatch(updateUser(data.data))
    }
  }, [data, dispatch])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div
        className="flex h-screen w-screen flex-col items-center justify-center gap-3"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
        <p className="text-xs text-[var(--muted-foreground)] font-medium">Verifying authentication security...</p>
      </div>
    )
  }

  if (isError) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
