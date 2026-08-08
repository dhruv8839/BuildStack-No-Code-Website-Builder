import { apiSlice } from '../../app/apiSlice'
import type { WorkspaceResponse } from '../../types/api'

export const workspacesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationWorkspaces: builder.query<WorkspaceResponse[], string>({
      query: (organizationId) => `/v1/organizations/${organizationId}/workspaces`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Workspace' as const, id })),
              { type: 'Workspace', id: 'LIST' },
            ]
          : [{ type: 'Workspace', id: 'LIST' }],
    }),
    createWorkspace: builder.mutation<WorkspaceResponse, { organizationId: string; body: any }>({
      query: ({ organizationId, body }) => ({
        url: `/v1/organizations/${organizationId}/workspaces`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetOrganizationWorkspacesQuery,
  useCreateWorkspaceMutation,
} = workspacesApiSlice
