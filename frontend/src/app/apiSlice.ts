import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { logout } from '../features/auth/authSlice'
import type { RootState } from './store'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api', // Using Vite proxy to backend in development
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    api.dispatch(logout())
  }
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Organization', 'Workspace', 'Project', 'Page', 'BuilderState'],
  endpoints: () => ({}),
})
