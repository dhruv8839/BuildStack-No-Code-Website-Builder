import { apiSlice } from '../../app/apiSlice';

export interface AssetResponse {
  id: string;
  workspaceId: string;
  filename: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  widthPx?: number;
  heightPx?: number;
  status: string;
  createdAt: string;
}

export const assetsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadAsset: builder.mutation<AssetResponse, { workspaceId: string; file: File }>({
      query: ({ workspaceId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/v1/workspaces/${workspaceId}/assets`,
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useUploadAssetMutation } = assetsApiSlice;
