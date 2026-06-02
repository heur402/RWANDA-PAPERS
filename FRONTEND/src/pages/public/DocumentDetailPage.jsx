import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Calendar, Tag, User, FileText, Eye, Share2, Clock } from 'lucide-react'
import { getDocument } from '../../api/documents.js'
import Spinner from '../../components/common/Spinner.jsx'

// Vite uses import.meta.env — fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

const DocumentDetailPage = () => {
  const { id } = useParams()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    getDocument(id)
      .then((res) => setDoc(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Document not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = () => {
    setDownloading(true)
    window.open(`${API_BASE}/api/documents/${id}/download`, '_blank')
    setTimeout(() => setDownloading(false), 1500)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: doc.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) return <Spinner />

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{error}</h2>
        <Link to="/documents" className="btn-primary">Back to Documents</Link>
      </div>
    )
  }

  const fileUrl = `${API_BASE}${doc.fileUrl}`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Documents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded uppercase mb-2 inline-block ${
                    doc.fileType === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {doc.fileType}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{doc.title}</h1>
              </div>
            </div>

            {doc.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{doc.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: Tag, label: 'Category', value: doc.category?.name },
                { icon: FileText, label: 'Subject', value: doc.subject },
                { icon: Calendar, label: 'Year', value: doc.year },
                { icon: Download, label: 'Downloads', value: doc.downloads?.toLocaleString() },
                { icon: User, label: 'Contributor', value: doc.contributorName || 'Anonymous' },
                {
                  icon: Clock,
                  label: 'Uploaded',
                  value: new Date(doc.createdAt).toLocaleDateString('en-RW', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  }),
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{value || '-'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Preview */}
          {doc.fileType === 'pdf' && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-700">Preview</h3>
              </div>
              <div className="bg-gray-100 h-[600px]">
                <iframe src={fileUrl} title={doc.title} className="w-full h-full" loading="lazy" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary w-full justify-center py-3"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Opening...' : 'Download Document'}
              </button>
              <button onClick={handleShare} className="btn-secondary w-full justify-center py-3">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
              <p className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                {doc.downloads?.toLocaleString()} total downloads
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Added {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Browse More</h3>
            <div className="space-y-2">
              <Link
                to={`/documents?category=${doc.category?._id}`}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <Tag className="w-4 h-4" /> More in {doc.category?.name}
              </Link>
              <Link
                to={`/documents?subject=${encodeURIComponent(doc.subject)}`}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <FileText className="w-4 h-4" /> More {doc.subject} papers
              </Link>
              <Link
                to={`/documents?year=${doc.year}`}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <Calendar className="w-4 h-4" /> More from {doc.year}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentDetailPage
