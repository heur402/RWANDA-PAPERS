import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Download, Calendar, Tag, User, Eye, Bookmark } from 'lucide-react'
import useSavedDocs from '../../hooks/useSavedDocs.js'

// ── pdfjs CDN loader (shared singleton) ──────────────────────────────────────
const PDFJS_VERSION = '4.4.168'
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.mjs`
const WORKER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`

let pdfjsLib = null
let pdfjsPromise = null

function loadPdfJs() {
  if (pdfjsLib) return Promise.resolve(pdfjsLib)
  if (pdfjsPromise) return pdfjsPromise
  pdfjsPromise = import(/* @vite-ignore */ PDFJS_CDN).then((mod) => {
    pdfjsLib = mod
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN
    return pdfjsLib
  })
  return pdfjsPromise
}

// ── Lazy: only render when card scrolls into view ─────────────────────────────
const LazyLoad = ({ children, onVisible }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          onVisible?.()
          obs.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [onVisible])

  return (
    <div ref={ref} className="w-full h-full">
      {visible ? children : <ThumbSkeleton />}
    </div>
  )
}

const ThumbSkeleton = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-400 rounded-full animate-spin" />
  </div>
)

// ── PDF page-1 thumbnail ──────────────────────────────────────────────────────
const PdfCardThumb = ({ documentId }) => {
  const canvasRef = useRef(null)
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)

  const render = useCallback(() => {
    let cancelled = false
    loadPdfJs()
      .then((lib) =>
        lib.getDocument({
          url: `/api/documents/${documentId}/preview`,
          withCredentials: false,
          disableRange: true,
          disableStream: true,
        }).promise
      )
      .then((pdf) => pdf.getPage(1))
      .then((page) => {
        if (cancelled) return
        const canvas = canvasRef.current
        if (!canvas) return
        const w = canvas.parentElement?.clientWidth || 280
        const scale = w / page.getViewport({ scale: 1 }).width
        const vp = page.getViewport({ scale })
        canvas.width = vp.width
        canvas.height = vp.height
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
      })
      .then(() => { if (!cancelled) setDone(true) })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [documentId])

  if (failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-red-50">
        <FileText className="w-10 h-10 text-red-300" />
        <p className="text-xs text-red-400">Preview unavailable</p>
      </div>
    )
  }

  return (
    <LazyLoad onVisible={render}>
      <div className="relative w-full h-full bg-white">
        {!done && <ThumbSkeleton />}
        <canvas
          ref={canvasRef}
          className="w-full h-auto block"
          style={{ display: done ? 'block' : 'none' }}
        />
      </div>
    </LazyLoad>
  )
}

// ── DOCX thumbnail ────────────────────────────────────────────────────────────
const DocxCardThumb = ({ title }) => (
  <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex flex-col items-center justify-center gap-3 px-4">
    {/* Word-style icon */}
    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
      <span className="text-white font-black text-3xl select-none leading-none">W</span>
    </div>
    <div className="text-center">
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Word Document</p>
      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{title}</p>
    </div>
  </div>
)

// ── Card ──────────────────────────────────────────────────────────────────────
const DocumentCard = ({ document }) => {
  const { _id, title, subject, category, year, downloads, contributorName, fileType } = document
  const { save, unsave, isSaved } = useSavedDocs()
  const saved = isSaved(_id)

  const toggleSave = (e) => {
    e.preventDefault() // don't navigate
    e.stopPropagation()
    saved ? unsave(_id) : save(document)
  }

  return (
    <Link
      to={`/documents/${_id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white
                 shadow-sm border border-gray-100
                 hover:shadow-xl hover:-translate-y-1 hover:border-primary-200
                 transition-all duration-300 ease-out"
    >
      {/* ── Thumbnail (3:4 portrait ratio — like a book/paper) ── */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
        {fileType === 'pdf'
          ? <PdfCardThumb documentId={_id} />
          : <DocxCardThumb title={title} />
        }

        {/* Gradient fade at bottom so info overlay reads cleanly */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* File type badge — top left */}
        <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold
                          px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md
                          ${fileType === 'pdf'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-600 text-white'}`}>
          {fileType}
        </span>

        {/* Year badge — top right */}
        <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold
                         bg-black/50 text-white backdrop-blur-sm
                         px-2 py-0.5 rounded-full">
          {year}
        </span>

        {/* "View" hover hint — centered */}
        <div className="absolute inset-0 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2
                          flex items-center gap-2 shadow-lg text-sm font-semibold text-gray-800">
            <Eye className="w-4 h-4 text-primary-600" />
            View
          </div>
        </div>

        {/* Title + subject overlaid on bottom of thumbnail */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-10">
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
          <p className="text-white/70 text-xs mt-0.5 truncate">{subject}</p>
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 bg-white border-t border-gray-50">

        {/* Category pill */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Tag className="w-3 h-3 text-primary-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">
            {category?.name || 'Uncategorised'}
          </span>
        </div>

        {/* Downloads + Save */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Download className="w-3 h-3" />
            <span>{downloads?.toLocaleString() ?? 0}</span>
          </div>
          <button
            onClick={toggleSave}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-all duration-200 ${
              saved
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-500 hover:bg-primary-100 hover:text-primary-700'
            }`}
            title={saved ? 'Remove from saved' : 'Save document'}
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <Bookmark className={`w-3 h-3 ${saved ? 'fill-current' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default DocumentCard
