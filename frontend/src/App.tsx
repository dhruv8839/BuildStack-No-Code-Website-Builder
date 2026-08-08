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

const BuilderShell = React.lazy(() => import('./features/builder/BuilderShell'))
const PreviewShell = React.lazy(() => import('./features/builder/PreviewShell'))
const FormSubmissionsPage = React.lazy(() => import('./features/projects/FormSubmissionsPage').then(m => ({ default: m.FormSubmissionsPage })))

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
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Builder...</div>}>
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
    element: <div className="flex h-screen items-center justify-center">404 Not Found</div>,
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
