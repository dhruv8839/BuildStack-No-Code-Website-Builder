import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiSlice } from '../../app/apiSlice'
import { useGetProjectQuery } from './projectsApiSlice'
import {
  ChevronLeft,
  Inbox,
  Download,
  Search,
  Filter,
  Mail,
  MessageSquare,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react'

// ─── API Types ────────────────────────────────────────────────────────────────
interface FormSubmissionResponse {
  id: string
  formNodeId: string
  projectId: string
  pageId: string
  name: string
  email: string
  message: string
  submittedAt: string
}

interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// Inject endpoint into the existing apiSlice
const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFormSubmissions: builder.query<PagedResponse<FormSubmissionResponse>, { projectId: string; page: number; size: number }>({
      query: ({ projectId, page, size }) => `/v1/projects/${projectId}/form-submissions?page=${page}&size=${size}`,
    }),
    getSubmissionCount: builder.query<number, string>({
      query: (projectId) => `/v1/projects/${projectId}/form-submissions/count`,
    }),
  }),
})

const { useGetFormSubmissionsQuery, useGetSubmissionCountQuery } = extendedApi

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function SubmissionCard({ sub }: { sub: FormSubmissionResponse }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        backgroundColor: '#1a1a2e',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.3)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px rgba(99,102,241,0.15)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700, color: 'white',
        }}>
          {sub.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7' }}>{sub.name}</span>
              <span style={{ fontSize: 11, color: '#818cf8', backgroundColor: 'rgba(99,102,241,0.1)', padding: '1px 8px', borderRadius: 99, border: '1px solid rgba(99,102,241,0.2)' }}>
                New
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#52525b', flexShrink: 0 }}>{formatDate(sub.submittedAt)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: expanded ? 12 : 0 }}>
            <Mail size={11} style={{ color: '#71717a', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#71717a' }}>{sub.email}</span>
          </div>

          {expanded && sub.message && (
            <div style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <MessageSquare size={12} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</span>
              </div>
              <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, margin: 0 }}>{sub.message}</p>
            </div>
          )}

          {!expanded && sub.message && (
            <p style={{ fontSize: 12, color: '#52525b', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
              {sub.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function FormSubmissionsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project } = useGetProjectQuery(projectId!)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  const { data, isLoading, isFetching, refetch, error } = useGetFormSubmissionsQuery(
    { projectId: projectId!, page, size: 20 },
    { skip: !projectId }
  )
  const { data: totalCount } = useGetSubmissionCountQuery(projectId!, { skip: !projectId })

  const handleExportCsv = () => {
    const link = document.createElement('a')
    link.href = `/api/v1/projects/${projectId}/form-submissions/export.csv`
    link.download = 'form-submissions.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredSubmissions = (data?.content || []).filter(sub =>
    !search ||
    sub.name.toLowerCase().includes(search.toLowerCase()) ||
    sub.email.toLowerCase().includes(search.toLowerCase()) ||
    sub.message?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#e4e4e7', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(9,9,11,0.9)',
        backdropFilter: 'blur(12px)',
        padding: '0 32px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            to={`/projects/${projectId}/builder`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 7,
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#71717a', textDecoration: 'none',
              transition: 'color 0.15s ease, background 0.15s ease',
            }}
          >
            <ChevronLeft size={16} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>B</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7' }}>{project?.name || 'Project'}</span>
                <span style={{ fontSize: 11, color: '#52525b' }}>›</span>
                <span style={{ fontSize: 13, color: '#818cf8', fontWeight: 500 }}>Form Submissions</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => refetch()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, height: 32,
              padding: '0 12px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#a1a1aa', fontSize: 12, fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, height: 32,
              padding: '0 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', color: 'white', fontSize: 12, fontWeight: 600,
              boxShadow: '0 1px 8px rgba(99,102,241,0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Submissions', value: totalCount ?? 0, icon: Inbox, color: '#818cf8' },
            { label: 'This Page', value: data?.totalElements ?? 0, icon: Mail, color: '#34d399' },
            { label: 'Pages', value: data?.totalPages ?? 1, icon: Filter, color: '#f59e0b' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{
              padding: '16px 20px', borderRadius: 12,
              backgroundColor: '#111113',
              border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                backgroundColor: `${color}15`,
                border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#e4e4e7', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 11, color: '#52525b', margin: 0 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
          <input
            type="text"
            placeholder="Search by name, email, or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', height: 40, paddingLeft: 36, paddingRight: 16,
              borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: '#111113', color: '#e4e4e7', fontSize: 13,
              outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.15s ease',
            }}
          />
        </div>

        {/* Submissions list */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10 }}>
            <Loader2 size={20} className="animate-spin" style={{ color: '#6366f1' }} />
            <span style={{ fontSize: 14, color: '#71717a' }}>Loading submissions…</span>
          </div>
        ) : error ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '20px 24px', borderRadius: 12,
            backgroundColor: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.2)',
          }}>
            <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, color: '#f87171', fontWeight: 600, margin: 0 }}>Failed to load submissions</p>
              <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0' }}>Make sure the backend is running and you have access to this project.</p>
            </div>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            border: '1px dashed rgba(255,255,255,0.07)',
            borderRadius: 16,
          }}>
            <Inbox size={40} style={{ color: '#27272a', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#52525b', margin: 0 }}>No submissions yet</p>
            <p style={{ fontSize: 13, color: '#3f3f46', margin: '8px 0 0' }}>
              {search ? 'No results match your search.' : 'Contact form submissions from your published pages will appear here.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#52525b' }}>
                {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
                {search && ` matching "${search}"`}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredSubmissions.map(sub => (
                <SubmissionCard key={sub.id} sub={sub} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    height: 32, padding: '0 14px', borderRadius: 7, cursor: page === 0 ? 'not-allowed' : 'pointer',
                    border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)',
                    color: page === 0 ? '#3f3f46' : '#a1a1aa', fontSize: 12, fontFamily: 'inherit',
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 12, color: '#52525b' }}>
                  Page {data.number + 1} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page >= data.totalPages - 1}
                  style={{
                    height: 32, padding: '0 14px', borderRadius: 7,
                    cursor: page >= data.totalPages - 1 ? 'not-allowed' : 'pointer',
                    border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)',
                    color: page >= data.totalPages - 1 ? '#3f3f46' : '#a1a1aa', fontSize: 12, fontFamily: 'inherit',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
