import { apiSlice } from '../../app/apiSlice'
import type { OrganizationResponse } from '../../types/api'

export const organizationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<OrganizationResponse[], void>({
      query: () => '/v1/organizations',
      providesTags: ['Organization'],
    }),
    getMyOrganizations: builder.query<OrganizationResponse[], void>({
      query: () => '/v1/organizations/my',
      providesTags: ['Organization'],
    }),
    createOrganization: builder.mutation<OrganizationResponse, any>({
      query: (body) => ({
        url: '/v1/organizations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Organization'],
    }),
  }),
})

export const {
  useGetOrganizationsQuery,
  useGetMyOrganizationsQuery,
  useCreateOrganizationMutation,
} = organizationsApiSlice
