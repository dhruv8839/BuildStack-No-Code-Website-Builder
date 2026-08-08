import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { addNode } from '../state/builderSlice'
import { NodeFactory } from '../utils/nodeFactory'
import { useUploadAssetMutation } from '../../assets/assetsApiSlice'
import { useGetProjectQuery } from '../../projects/projectsApiSlice'
import { useParams } from 'react-router-dom'
import { Search, Upload, Image as ImageIcon, Loader2, X, Sparkles } from 'lucide-react'

// ─── Curated High-Res Unsplash Stock Photo Library ──────────────────────────────
const CURATED_STOCK_PHOTOS = [
  { id: '1', title: 'Modern Workspace', category: 'technology', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '2', title: 'Creative Team Studio', category: 'business', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '3', title: 'Minimalist Architecture', category: 'architecture', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '4', title: 'SaaS Analytics Dashboard', category: 'technology', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '5', title: 'Strategy & Brainstorming', category: 'business', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '6', title: 'E-Commerce Product Display', category: 'store', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '7', title: 'Metropolitan City Skyline', category: 'city', url: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '8', title: 'Abstract Fluid Gradient', category: 'abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '9', title: 'Developer Code Editor', category: 'technology', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '10', title: 'Modern Living Space', category: 'architecture', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '11', title: 'Minimalist Coffee Setup', category: 'minimalist', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' },
  { id: '12', title: 'Financial Charts & Growth', category: 'business', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', author: 'Unsplash' }
]

type TabType = 'uploads' | 'unsplash'

export function AssetsPanel() {
  const dispatch = useDispatch()
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project } = useGetProjectQuery(projectId!)
  const selectedNodeId = useSelector((state: RootState) => state.builder.selectedNodeId)
  const rootNodeId = useSelector((state: RootState) => state.builder.rootNodeId)

  const [activeTab, setActiveTab] = useState<TabType>('unsplash')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [uploadedPhotos, setUploadedPhotos] = useState<{ url: string; name: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadAsset] = useUploadAssetMutation()

  // Filter stock photos based on search or selected category
  const filteredStockPhotos = CURATED_STOCK_PHOTOS.filter((photo) => {
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory
    const matchesSearch = !searchQuery.trim() ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Insert image onto canvas
  const handleInsertImage = (imageUrl: string, altText: string) => {
    const parentId = selectedNodeId || rootNodeId
    if (!parentId) return

    const imageNode = NodeFactory.createNode('image', parentId)
    imageNode.content.src = imageUrl
    imageNode.content.alt = altText
    imageNode.style.desktop = {
      ...imageNode.style.desktop,
      width: '100%',
      maxWidth: '600px',
      height: 'auto',
      borderRadius: '8px',
      objectFit: 'cover',
      marginBottom: '16px',
    }

    dispatch(addNode({ parentId, node: imageNode }))
  }

  // Handle local file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !project?.workspaceId) return

    setIsUploading(true)
    try {
      const response = await uploadAsset({ workspaceId: project.workspaceId, file }).unwrap()
      setUploadedPhotos((prev) => [{ url: response.url, name: file.name }, ...prev])
    } catch (err) {
      console.error('File upload failed', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={{
      width: 280, height: '100%', backgroundColor: '#111113',
      borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column',
      color: '#e4e4e7', fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5', margin: 0 }}>Asset Library</h3>
        <p style={{ fontSize: 11, color: '#71717a', margin: '4px 0 0' }}>Insert high-res stock photos or custom uploads</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '8px 12px', gap: 6 }}>
        <button
          onClick={() => setActiveTab('unsplash')}
          style={{
            padding: '7px 0', fontSize: 12, fontWeight: 500, border: 'none', borderRadius: 6, cursor: 'pointer',
            backgroundColor: activeTab === 'unsplash' ? '#6366f1' : 'transparent',
            color: activeTab === 'unsplash' ? 'white' : '#a1a1aa', transition: 'all 0.15s ease'
          }}
        >
          Unsplash Photos
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          style={{
            padding: '7px 0', fontSize: 12, fontWeight: 500, border: 'none', borderRadius: 6, cursor: 'pointer',
            backgroundColor: activeTab === 'uploads' ? '#6366f1' : 'transparent',
            color: activeTab === 'uploads' ? 'white' : '#a1a1aa', transition: 'all 0.15s ease'
          }}
        >
          My Uploads
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }} className="studio-scrollbar">
        {activeTab === 'unsplash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
              <input
                type="text"
                placeholder="Filter stock photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', height: 34, paddingLeft: 30, paddingRight: 10,
                  borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(255,255,255,0.05)', color: '#e4e4e7', fontSize: 12, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }} className="studio-scrollbar">
              {['all', 'technology', 'business', 'architecture', 'store', 'abstract'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '4px 10px', fontSize: 10, fontWeight: 500, borderRadius: 99, border: 'none', cursor: 'pointer', whitespace: 'nowrap',
                    backgroundColor: selectedCategory === cat ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    color: selectedCategory === cat ? '#818cf8' : '#a1a1aa',
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {filteredStockPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handleInsertImage(photo.url, photo.title)}
                  style={{
                    position: 'relative', borderRadius: 8, overflow: 'hidden', height: 90,
                    border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                    backgroundColor: '#18181b'
                  }}
                >
                  <img src={photo.thumb} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    display: 'flex', alignItems: 'flex-end', padding: 6, opacity: 0.9
                  }}>
                    <span style={{ fontSize: 10, color: 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {photo.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                width: '100%', height: 40, borderRadius: 8, border: '1px dashed rgba(99,102,241,0.4)',
                backgroundColor: 'rgba(99,102,241,0.05)', color: '#818cf8', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload Image
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />

            {uploadedPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#52525b' }}>
                <ImageIcon size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: 12, margin: 0 }}>No uploaded files yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {uploadedPhotos.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleInsertImage(img.url, img.name)}
                    style={{
                      position: 'relative', borderRadius: 8, overflow: 'hidden', height: 90,
                      border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer'
                    }}
                  >
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
