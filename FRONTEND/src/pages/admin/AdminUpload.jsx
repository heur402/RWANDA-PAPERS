import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { adminUploadDocument } from '../../api/admin.js'
import { getCategories } from '../../api/categories.js'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i)

const AdminUpload = () => {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', subject: '', category: '', year: '',
  })
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data)).catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    setFileError('')
    if (!selected) return setFile(null)
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(selected.type)) {
      setFileError('Only PDF and DOCX files are allowed.')
      return setFile(null)
    }
    if (selected.size > 20 * 1024 * 1024) {
      setFileError('File must be smaller than 20MB.')
      return setFile(null)
    }
    setFile(selected)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setFileError('Please select a file.')
    if (!form.category) {
      toast.error('Please select a category.')
      return
    }

    const formData = new FormData()
    ;['title', 'description', 'subject', 'category', 'year'].forEach((key) => {
      if (form[key]) formData.append(key, form[key])
    })
    formData.append('file', file)

    setLoading(true)
    try {
      const { data } = await adminUploadDocument(formData)
      toast.success(`"${data.data.title}" published successfully!`)
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({ title: '', description: '', subject: '', category: '', year: '' })
    setFile(null)
    setFileError('')
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="card p-10">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Published!</h2>
          <p className="text-gray-500 mb-6">
            Your document is now live and visible to all visitors.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={resetForm} className="btn-primary">Upload Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-sm text-gray-500 mt-1">
          Documents you upload here are published immediately — no approval needed.
        </p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label" htmlFor="title">Document Title *</label>
            <input
              id="title" name="title" type="text" required
              value={form.title} onChange={handleChange}
              placeholder="e.g. Mathematics P2 Past Paper 2023"
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description" name="description" rows={3}
              value={form.description} onChange={handleChange}
              placeholder="Brief description (optional)"
              className="input resize-none"
            />
          </div>

          {/* Subject + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="subject">Subject *</label>
              <input
                id="subject" name="subject" type="text" required
                value={form.subject} onChange={handleChange}
                placeholder="e.g. Mathematics" className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="category">Category *</label>
              <select
                id="category" name="category" required
                value={form.category} onChange={handleChange} className="input"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year */}
          <div className="w-full sm:w-1/2">
            <label className="label" htmlFor="year">Year *</label>
            <select
              id="year" name="year" required
              value={form.year} onChange={handleChange} className="input"
            >
              <option value="">Select year</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* File upload */}
          <div>
            <label className="label" htmlFor="admin-file">File (PDF / DOCX) *</label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                fileError
                  ? 'border-red-300 bg-red-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <input
                id="admin-file" type="file" accept=".pdf,.doc,.docx"
                onChange={handleFileChange} className="hidden"
              />
              <label htmlFor="admin-file" className="cursor-pointer block">
                <FileText className={`w-10 h-10 mx-auto mb-2 ${file ? 'text-green-500' : 'text-gray-400'}`} />
                {file ? (
                  <>
                    <p className="font-medium text-green-700">{file.name}</p>
                    <p className="text-xs text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-700">Click to select a file</p>
                    <p className="text-xs text-gray-500 mt-1">PDF or DOCX, max 20MB</p>
                  </>
                )}
              </label>
            </div>
            {fileError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {fileError}
              </p>
            )}
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-2 p-3 bg-primary-50 border border-primary-100 rounded-lg text-sm text-primary-700">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            This document will be <strong className="mx-1">published immediately</strong> without going through the approval queue.
          </div>

          <button
            type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3 text-base"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              <><Upload className="w-5 h-5" /> Publish Document</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminUpload
