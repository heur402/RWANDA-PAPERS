import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Maximize2, Loader, AlertCircle,
} from 'lucide-react'

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

// ── Shared hook: load & render a PDF page onto a canvas ─────────────────────
function usePdfPage(fileUrl, pageNum, scale) {
  const canvasRef = useRef(null)
  const [numPages, setNumPages] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const renderTaskRef = useRef(null)
  const pdfRef = useRef(null)

  // Load the PDF document
  useEffect(() => {
    if (!fileUrl) return
    let cancelled = false
    setLoading(true)
    setError(null)
    pdfRef.current = null
    setNumPages(null)

    loadPdfJs()
      .then((lib) => {
        // URL is now /api/documents/:id/preview — looks like an API call to IDM,
        // not a .pdf file, so IDM leaves it alone.
        // pdfjs's internal XHR loader handles it cleanly.
        return lib.getDocument({
          url: fileUrl,
          withCredentials: false,
          disableRange: true,
          disableStream: true,
        }).promise
      })
      .then((pdf) => {
        if (cancelled) return
        pdfRef.current = pdf
        setNumPages(pdf.numPages)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load PDF')
      })

    return () => { cancelled = true }
  }, [fileUrl])

  // Render the requested page whenever pdf, page, or scale changes
  useEffect(() => {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas) return

    let cancelled = false

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      renderTaskRef.current = null
    }

    pdf.getPage(pageNum).then((page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      const task = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = task
      return task.promise
    })
      .then(() => { if (!cancelled) setLoading(false) })
      .catch((e) => {
        if (!cancelled && e?.name !== 'RenderingCancelledException') {
          setError(e.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [pdfRef.current, pageNum, scale]) // eslint-disable-line

  return { canvasRef, numPages, error, loading }
}

// ── Spinner / Error shared UI ────────────────────────────────────────────────
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
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
        style={{ display: loading ? 'none' : 'block' }}
      />

      {/* Hover overlay */}
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

// ── Full-screen modal: all pages, zoom, navigation ───────────────────────────
export const PdfModal = ({ fileUrl, title, onClose }) => {
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const { canvasRef, numPages, error, loading } = usePdfPage(fileUrl, page, scale)

  const zoomIn  = useCallback(() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2))), [])
  const zoomOut = useCallback(() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2))), [])
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])
  const nextPage = useCallback(() => setPage((p) => Math.min(numPages ?? 1, p + 1)), [numPages])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')       onClose()
      if (e.key === 'ArrowRight')   nextPage()
      if (e.key === 'ArrowLeft')    prevPage()
      if (e.key === '+')            zoomIn()
      if (e.key === '-')            zoomOut()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, nextPage, prevPage, zoomIn, zoomOut])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm">

      {/* ── Top toolbar ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-gray-950 text-white flex-shrink-0 gap-2">
        {/* Title */}
        <p className="text-sm font-medium truncate flex-1 min-w-0 mr-2">{title}</p>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Zoom */}
          <button onClick={zoomOut} className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Zoom out (-)">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs w-10 text-center tabular-nums select-none">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Zoom in (+)">
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-600 mx-1" />

          {/* Page navigation */}
          <button onClick={prevPage} disabled={page <= 1} className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors" title="Previous page (←)">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs tabular-nums whitespace-nowrap select-none min-w-[50px] text-center">
            {page} / {numPages ?? '…'}
          </span>
          <button onClick={nextPage} disabled={page >= (numPages ?? 1)} className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-colors" title="Next page (→)">
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-600 mx-1" />

          {/* Close */}
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-600 transition-colors" title="Close (Esc)">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── PDF canvas area ── */}
      <div
        className="flex-1 overflow-auto flex justify-center items-start py-6 px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {error ? (
          <PdfError message={error} />
        ) : (
          <div className="relative shadow-2xl bg-white">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 min-w-[400px] min-h-[500px]">
                <PdfLoading />
              </div>
            )}
            <canvas ref={canvasRef} className="block max-w-full" />
          </div>
        )}
      </div>

      {/* ── Bottom page bar ── */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-3 bg-gray-950 flex-shrink-0">
          <button
            onClick={prevPage} disabled={page <= 1}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg text-white text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-white text-sm tabular-nums select-none">
            Page {page} of {numPages}
          </span>
          <button
            onClick={nextPage} disabled={page >= numPages}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 rounded-lg text-white text-sm transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
