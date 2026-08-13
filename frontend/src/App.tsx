import React, { Suspense, useEffect } from 'react'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from './components/ui/sonner'
import { store } from './app/store'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layouts/DashboardLayout'
import { DashboardIndex } from './features/dashboard/DashboardIndex'
import { OrganizationsList } from './features/organizations/OrganizationsList'
import { WorkspacesList } from './features/workspaces/WorkspacesList'
import { ProjectsList } from './features/projects/ProjectsList'
import { GlobalProjectsPage } from './features/projects/GlobalProjectsPage'
import { SettingsPage } from './features/settings/SettingsPage'

// Helper to auto-retry dynamic module imports when Vite HMR cache shifts
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const pageHasBeenRefreshed = JSON.parse(
      window.sessionStorage.getItem('page_has_been_refreshed') || 'false'
    );
    try {
      const component = await factory();
      window.sessionStorage.setItem('page_has_been_refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenRefreshed) {
        window.sessionStorage.setItem('page_has_been_refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

const BuilderShell = lazyWithRetry(() => import('./features/builder/BuilderShell'))
const PreviewShell = lazyWithRetry(() => import('./features/builder/PreviewShell'))
const FormSubmissionsPage = lazyWithRetry(() => import('./features/projects/FormSubmissionsPage').then(m => ({ default: m.FormSubmissionsPage })))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardIndex />,
          },
          {
            path: 'projects',
            element: <GlobalProjectsPage />,
          },
          {
            path: 'organizations',
            element: <OrganizationsList />,
          },
          {
            path: 'organizations/:organizationId/workspaces',
            element: <WorkspacesList />,
          },
          {
            path: 'workspaces/:workspaceId/projects',
            element: <ProjectsList />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: '/projects/:projectId/builder',
        element: (
          <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#09090b] text-indigo-400 font-semibold">Loading Builder Studio…</div>}>
            <BuilderShell />
          </Suspense>
        ),
      },
      {
        path: '/projects/:projectId/preview',
        element: (
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Preview...</div>}>
            <PreviewShell />
          </Suspense>
        ),
      },
      {
        path: '/published/:pageId',
        element: (
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Page...</div>}>
            <PreviewShell />
          </Suspense>
        ),
      },
      {
        path: '/projects/:projectId/form-submissions',
        element: (
          <Suspense fallback={<div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#09090b', color: '#71717a' }}>Loading...</div>}>
            <FormSubmissionsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b',
        fontFamily: "'Inter', sans-serif", textAlign: 'center', padding: '24px',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18, marginBottom: 24,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
        }}>🚫</div>
        <h1 style={{ fontSize: 56, fontWeight: 800, color: '#e4e4e7', margin: '0 0 8px', letterSpacing: '-0.03em' }}>404</h1>
        <p style={{ fontSize: 16, color: '#71717a', marginBottom: 28 }}>This page doesn't exist or was moved.</p>
        <a href="/dashboard" style={{
          padding: '10px 24px', backgroundColor: '#6366f1', color: 'white',
          borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
        }}>← Go to Dashboard</a>
      </div>
    ),
  }
])

import { applyThemeAndAccent } from './utils/themeManager'

function App() {
  useEffect(() => {
    applyThemeAndAccent()
  }, [])

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster />
    </Provider>
  )
}

export default App
