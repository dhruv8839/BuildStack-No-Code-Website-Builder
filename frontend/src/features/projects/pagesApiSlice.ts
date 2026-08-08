import { apiSlice } from '../../app/apiSlice'
import type { PageResponse, PageCreateRequest, BuilderStateDto } from '../../types/api'

export const pagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPagesForProject: builder.query<PageResponse[], string>({
      query: (projectId) => `/v1/projects/${projectId}/pages`,
      providesTags: (_result, _error, id) => [{ type: 'Page', id: `LIST-${id}` }],
    }),
    getPage: builder.query<PageResponse, string>({
      query: (pageId) => `/v1/pages/${pageId}`,
      providesTags: (_result, _error, id) => [{ type: 'Page', id }],
    }),
    createPage: builder.mutation<PageResponse, PageCreateRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/v1/projects/${projectId}/pages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Page', id: `LIST-${projectId}` },
      ],
    }),
    deletePage: builder.mutation<void, { pageId: string; projectId: string }>({
      query: ({ pageId }) => ({
        url: `/v1/pages/${pageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Page', id: `LIST-${projectId}` },
      ],
    }),
    getBuilderState: builder.query<BuilderStateDto | null, string>({
      query: (pageId) => ({
        url: `/v1/pages/${pageId}/builder-state`,
      }),
      // We don't cache this strictly via standard tags because Redux holds the live state
      // but we can provide a tag just in case we need to invalidate
      providesTags: (_result, _error, id) => [{ type: 'BuilderState', id }],
    }),
    saveBuilderState: builder.mutation<BuilderStateDto, { pageId: string; state: BuilderStateDto }>({
      query: ({ pageId, state }) => ({
        url: `/v1/pages/${pageId}/builder-state`,
        method: 'PUT',
        body: state,
      }),
    }),
  }),
})

export const {
  useGetPagesForProjectQuery,
  useGetPageQuery,
  useCreatePageMutation,
  useDeletePageMutation,
  useGetBuilderStateQuery,
  useSaveBuilderStateMutation,
} = pagesApiSlice
