import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Building2, LogOut, Sparkles, UserCircle, Settings, BookOpen } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { Button } from '../components/ui/button'
import { QuickGuideModal } from '../features/guide/QuickGuideModal'
import { applyThemeAndAccent } from '../utils/themeManager'

export function DashboardLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useAppSelector((state) => state.auth.user)

  const [isGuideOpen, setIsGuideOpen] = useState(false)

  // Ensure user theme choice is preserved across all navigation routes
  useEffect(() => {
    applyThemeAndAccent()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
    { path: '/projects',      label: 'Projects',       icon: FolderKanban },
    { path: '/organizations', label: 'Organizations',  icon: Building2 },
    { path: '/settings',      label: 'Settings',       icon: Settings },
  ]

  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Creator'

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <QuickGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] md:flex transition-colors duration-200">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-lg text-[var(--foreground)]">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="tracking-tight">BuildStack</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-auto py-4 px-3 studio-scrollbar">
          <nav className="space-y-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    isActive
                      ? 'font-semibold border'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: 'rgba(var(--primary-rgb, 99, 102, 241), 0.12)',
                          color: 'var(--primary)',
                          borderColor: 'var(--primary)',
                        }
                      : undefined
                  }
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: isActive ? 'var(--primary)' : undefined }}
                  />
                  {item.label}
                </Link>
              )
            })}

            {/* How to Use Guide Sidebar Link */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors text-left cursor-pointer"
            >
              <BookOpen className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              How to Use Guide
            </button>
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] space-y-3">
          <div className="flex items-center space-x-3 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]">
              <UserCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--foreground)] truncate">{userName}</p>
              <p className="text-[11px] text-[var(--muted-foreground)] truncate">{currentUser?.email || 'Logged in'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 h-9 text-xs border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex flex-col md:pl-64 w-full min-h-screen bg-[var(--background)]">
        {/* Top App Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold capitalize text-[var(--foreground)]">
              {location.pathname.split('/')[1] || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGuideOpen(true)}
              className="gap-2 text-xs border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
              <span>How to Use</span>
            </Button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-6 lg:p-8 bg-[var(--background)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
