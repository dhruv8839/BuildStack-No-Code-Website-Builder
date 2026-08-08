import { useMemo } from 'react';
import { useGetMyOrganizationsQuery } from '../../organizations/organizationsApiSlice';
import type { ProjectResponse, WorkspaceResponse } from '../../../types/api';

export interface EnrichedProject extends ProjectResponse {
  organizationId: string;
  organizationName: string;
  workspaceId: string;
  workspaceName: string;
}

export interface EnrichedWorkspace extends WorkspaceResponse {
  organizationId: string;
  organizationName: string;
}

export function useAllUserProjects() {
  const { data: organizations = [], isLoading: isOrgsLoading } = useGetMyOrganizationsQuery();

  const orgIds = useMemo(() => organizations.map((org) => org.id), [organizations]);

  return {
    organizations,
    orgIds,
    isOrgsLoading,
  };
}
