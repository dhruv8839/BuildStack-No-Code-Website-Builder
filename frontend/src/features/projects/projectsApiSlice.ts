import { apiSlice } from '../../app/apiSlice'
import type { ProjectResponse, ProjectCreateRequest } from '../../types/api'

export const projectsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjectsForWorkspace: builder.query<ProjectResponse[], string>({
      query: (workspaceId) => `/v1/projects/workspace/${workspaceId}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id: `LIST-${id}` }],
    }),
    getProject: builder.query<ProjectResponse, string>({
      query: (projectId) => `/v1/projects/${projectId}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<ProjectResponse, ProjectCreateRequest>({
      query: (credentials) => ({
        url: '/v1/projects',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'Project', id: `LIST-${workspaceId}` },
      ],
    }),
    deleteProject: builder.mutation<void, { projectId: string; workspaceId: string }>({
      query: ({ projectId }) => ({
        url: `/v1/projects/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { workspaceId }) => [
        { type: 'Project', id: `LIST-${workspaceId}` },
      ],
    }),
  }),
})

export const {
  useGetProjectsForWorkspaceQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
} = projectsApiSlice
