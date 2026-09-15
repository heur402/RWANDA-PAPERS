import React, { useEffect, useRef, useState, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, Maximize2, Loader, AlertCircle } from 'lucide-react'

// ── Load pdfjs from CDN once ─────────────────────────────────────────────────
const PDFJS_VERSION = '4.4.168'
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.mjs`
const WORKER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`

let pdfjsLib = null
let loadPromise = null

function loadPdfJs() {
  if (pdfjsLib) return Promise.resolve(pdfjsLib)
  if (loadPromise) return loadPromise
  loadPromise = import(/* @vite-ignore */ PDFJS_CDN).then((mod) => {
    pdfjsLib = mod
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN
    return pdfjsLib
  })
  return loadPromise
}

// ── Shared hook: load & render a single page (used by thumbnail) ─────────────
function usePdfPage(fileUrl, pageNum, scale) {
  const canvasRef = useRef(null)
  const [numPages, setNumPages] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const renderTaskRef = useRef(null)
  const pdfRef = useRef(null)

  useEffect(() => {
    if (!fileUrl) return
    let cancelled = false
    setLoading(true); setError(null); pdfRef.current = null; setNumPages(null)

    loadPdfJs()
      .then((lib) => lib.getDocument({ url: fileUrl, withCredentials: false, disableRange: true, disableStream: true }).promise)
      .then((pdf) => { if (!cancelled) { pdfRef.current = pdf; setNumPages(pdf.numPages) } })
      .catch((e) => { if (!cancelled) setError(e.message || 'Failed to load PDF') })

    return () => { cancelled = true }
  }, [fileUrl])

  useEffect(() => {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas) return
    let cancelled = false
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null }

    pdf.getPage(pageNum).then((page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width; canvas.height = viewport.height
      const task = page.render({ canvasContext: canvas.getContext('2d'), viewport })
      renderTaskRef.current = task
      return task.promise
    })
      .then(() => { if (!cancelled) setLoading(false) })
      .catch((e) => { if (!cancelled && e?.name !== 'RenderingCancelledException') { setError(e.message); setLoading(false) } })

    return () => { cancelled = true }
  }, [pdfRef.current, pageNum, scale]) // eslint-disable-line

  return { canvasRef, numPages, error, loading }
}

// ── Hook: load full PDF document for all-pages modal ─────────────────────────
function usePdfDocument(fileUrl) {
  const [pdf, setPdf] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!fileUrl) return
    let cancelled = false
    setLoading(true); setError(null); setPdf(null)

    loadPdfJs()
      .then((lib) => lib.getDocument({ url: fileUrl, withCredentials: false, disableRange: true, disableStream: true }).promise)
      .then((doc) => { if (!cancelled) { setPdf(doc); setLoading(false) } })
      .catch((e) => { if (!cancelled) { setError(e.message || 'Failed to load PDF'); setLoading(false) } })

    return () => { cancelled = true }
  }, [fileUrl])

  return { pdf, error, loading }
}

// ── Single page canvas rendered inside the all-pages scroll view ──────────────
function PdfPage({ pdf, pageNum, scale }) {
  const canvasRef = useRef(null)
  const renderTaskRef = useRef(null)

  useEffect(() => {
    if (!pdf) return
    let cancelled = false
    if (renderTaskRef.current) { renderTaskRef.current.cancel(); renderTaskRef.current = null }

    pdf.getPage(pageNum).then((page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = viewport.width; canvas.height = viewport.height
      const task = page.render({ canvasContext: canvas.getContext('2d'), viewport })
      renderTaskRef.current = task
      return task.promise
    }).catch((e) => {
      if (e?.name !== 'RenderingCancelledException') console.warn('Page render error', e)
    })

    return () => { cancelled = true }
  }, [pdf, pageNum, scale])

  return (
    <div className="flex justify-center mb-3">
      <div className="shadow-lg bg-white relative">
        <canvas ref={canvasRef} className="block max-w-full" />
        <span className="absolute bottom-1 right-2 text-[10px] text-gray-400 select-none">{pageNum}</span>
      </div>
    </div>
  )
}

// ── Shared UI ────────────────────────────────────────────────────────────────
const PdfLoading = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400 w-full">
    <Loader className="w-8 h-8 animate-spin text-primary-500" />
    <p className="text-sm">Loading PDF…</p>
  </div>
)

const PdfError = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400 w-full">
    <AlertCircle className="w-8 h-8 text-red-400" />
    <p className="text-sm text-red-500 text-center px-4">{message || 'Could not load PDF'}</p>
  </div>
)

// ── Thumbnail: renders page 1 only, click → fullscreen ───────────────────────
export const PdfThumbnail = ({ fileUrl, onExpand }) => {
  const { canvasRef, error, loading } = usePdfPage(fileUrl, 1, 1.2)

  if (error) return <PdfError message={error} />

  return (
    <div
      className="relative group cursor-pointer w-full overflow-hidden bg-gray-50"
      onClick={onExpand}
      role="button"
      tabIndex={0}
      aria-label="Click to view full document"
      onKeyDown={(e) => e.key === 'Enter' && onExpand()}
    >
      {loading && <PdfLoading />}
      <canvas ref={canvasRef} className="w-full h-auto block" style={{ display: loading ? 'none' : 'block' }} />
      {!loading && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2 text-white">
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-4 shadow-lg">
              <Maximize2 className="w-7 h-7" />
            </div>
            <span className="text-sm font-semibold drop-shadow-lg bg-black/40 px-3 py-1 rounded-full">
              Click to view full document
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Full-screen modal: ALL pages, continuous scroll ───────────────────────────
export const PdfModal = ({ fileUrl, title, onClose }) => {
  const [scale, setScale] = useState(1.2)
  const { pdf, error, loading } = usePdfDocument(fileUrl)

  const zoomIn  = useCallback(() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2))), [])
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2))), [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+') zoomIn()
      if (e.key === '-') zoomOut()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, zoomIn, zoomOut])

  const pages = pdf ? Array.from({ length: pdf.numPages }, (_, i) => i + 1) : []

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">

      {/* ── Top toolbar ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-gray-950 text-white flex-shrink-0 gap-2">
        <p className="text-sm font-medium truncate flex-1 min-w-0 mr-2">{title}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={zoomOut} className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Zoom out (-)">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs w-10 text-center tabular-nums select-none">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Zoom in (+)">
            <ZoomIn className="w-4 h-4" />
          </button>
          {pdf && (
            <>
              <div className="w-px h-5 bg-gray-600 mx-1" />
              <span className="text-xs text-gray-400 select-none">{pdf.numPages} pages</span>
            </>
          )}
          <div className="w-px h-5 bg-gray-600 mx-1" />
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-600 transition-colors" title="Close (Esc)">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable all-pages area ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 bg-gray-800">
        {loading && <PdfLoading />}
        {error && <PdfError message={error} />}
        {pages.map((pageNum) => (
          <PdfPage key={`${pageNum}-${scale}`} pdf={pdf} pageNum={pageNum} scale={scale} />
        ))}
      </div>
    </div>
  )
}
