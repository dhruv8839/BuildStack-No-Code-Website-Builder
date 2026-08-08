export interface UserResponse {
  id: number
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  roles: string[]
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserResponse
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface OrganizationResponse {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  createdById: number
  createdAt: string
  updatedAt: string
}

export interface WorkspaceResponse {
  id: string
  organizationId: string
  name: string
  description?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectResponse {
  id: string
  workspaceId: string
  name: string
  slug: string
  description?: string
  customDomain?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export interface ProjectCreateRequest {
  workspaceId: string
  name: string
  slug: string
  description?: string
}

export interface PageResponse {
  id: string
  projectId: string
  name: string
  slug: string
  title?: string
  description?: string
  isHomePage: boolean
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
  updatedAt: string
}

export interface PageCreateRequest {
  projectId: string
  name: string
  slug: string
  title?: string
  description?: string
  isHomePage: boolean
}

export interface BuilderNodeDto {
  id: string
  type: string
  parentId: string | null
  children: string[]
  content: Record<string, any>
  style: Record<string, any>
  settings: Record<string, any>
}

export interface BuilderStateDto {
  version: number | null
  schemaVersion: number
  rootNodeId: string
  nodes: Record<string, BuilderNodeDto>
}
