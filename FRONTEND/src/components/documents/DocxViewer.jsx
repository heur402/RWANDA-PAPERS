import React, { useEffect, useState } from 'react'
import { Loader, AlertCircle, Maximize2, X, FileText, ExternalLink } from 'lucide-react'

const isLocalhost =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// ── Load mammoth from CDN via a <script> tag (avoids Vite bundler issues) ───
const MAMMOTH_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js'

function loadMammoth() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.mammoth) return resolve(window.mammoth)

    // Already injected but not yet ready — wait for load
    const existing = document.getElementById('mammoth-script')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.mammoth))
      existing.addEventListener('error', () => reject(new Error('Failed to load mammoth')))
      return
    }

    // Inject script tag
    const script = document.createElement('script')
    script.id = 'mammoth-script'
    script.src = MAMMOTH_CDN
    script.onload = () => resolve(window.mammoth)
    script.onerror = () => reject(new Error('Failed to load mammoth from CDN'))
    document.head.appendChild(script)
  })
}

// ── Shared UI ────────────────────────────────────────────────────────────────
const DocLoading = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400 w-full min-h-[200px]">
    <Loader className="w-8 h-8 animate-spin text-primary-500" />
    <p className="text-sm">Loading document…</p>
  </div>
)

const DocError = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 w-full px-4">
    <AlertCircle className="w-8 h-8 text-red-400" />
    <p className="text-sm text-red-500 text-center">{message}</p>
  </div>
)

// ── Local dev: fetch bytes → mammoth → HTML ──────────────────────────────────
const MammothPreview = ({ previewUrl, style }) => {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setHtml('')

    Promise.all([
      loadMammoth(),
      fetch(previewUrl).then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.arrayBuffer()
      }),
    ])
      .then(([mammoth, buffer]) =>
        mammoth.convertToHtml({ arrayBuffer: buffer })
      )
      .then(({ value }) => {
        if (!cancelled) setHtml(value)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Could not render document')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [previewUrl])

  if (loading) return <DocLoading />
  if (error) return <DocError message={error} />

  return (
    <div
      className="bg-white px-8 sm:px-16 py-10 overflow-y-auto
                 prose prose-sm max-w-none
                 font-serif text-gray-800 leading-relaxed"
      style={style}
      // mammoth output only contains safe formatting tags — no scripts
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ── Production: Office Online Viewer ────────────────────────────────────────
const OfficeOnlinePreview = ({ publicFileUrl, height }) => {
  const src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicFileUrl)}`
  return (
    <iframe
      src={src}
      title="Document preview"
      className="w-full border-0"
      style={{ height }}
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  )
}

// ── Full-screen modal ────────────────────────────────────────────────────────
export const DocxModal = ({ previewUrl, publicFileUrl, title, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const contentHeight = window.innerHeight - 56 // minus toolbar

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-gray-950 text-white flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <p className="text-sm font-medium truncate">{title}</p>
          {isLocalhost && (
            <span className="hidden sm:inline text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full flex-shrink-0">
              Local preview
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!isLocalhost && publicFileUrl && (
            <a
              href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(publicFileUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Office Online
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-red-600 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLocalhost ? (
          <MammothPreview
            previewUrl={previewUrl}
            style={{ height: contentHeight, maxHeight: contentHeight }}
          />
        ) : (
          <OfficeOnlinePreview
            publicFileUrl={publicFileUrl}
            height={contentHeight}
          />
        )}
      </div>
    </div>
  )
}

// ── Thumbnail card ───────────────────────────────────────────────────────────
export const DocxThumbnail = ({ title, onExpand }) => (
  <div
    className="relative group cursor-pointer w-full bg-gradient-to-br from-blue-50 to-indigo-50
               flex flex-col items-center justify-center py-16 gap-4"
    onClick={onExpand}
    role="button"
    tabIndex={0}
    aria-label="Click to preview document"
    onKeyDown={(e) => e.key === 'Enter' && onExpand()}
  >
    {/* Word-style icon */}
    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
      <span className="text-white font-bold text-3xl select-none leading-none">W</span>
    </div>

    <div className="text-center px-6">
      <p className="font-semibold text-gray-700 text-sm line-clamp-2">{title}</p>
      <p className="text-xs text-gray-400 mt-1">DOCX Document · Click to preview</p>
    </div>

    {/* Hover overlay */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2 text-white">
        <div className="bg-black/40 backdrop-blur-sm rounded-full p-4 shadow-lg">
          <Maximize2 className="w-7 h-7" />
        </div>
        <span className="text-sm font-semibold drop-shadow-lg bg-black/40 px-3 py-1 rounded-full">
          Click to view document
        </span>
      </div>
    </div>
  </div>
)
