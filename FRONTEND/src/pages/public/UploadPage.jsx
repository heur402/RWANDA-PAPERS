import React, { useEffect, useState } from 'react'
import { Upload, CheckCircle, FileText, AlertCircle } from 'lucide-react'
import { submitDocument } from '../../api/uploads.js'
import { getCategories } from '../../api/categories.js'

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i)

const UploadPage = () => {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    category: '',
    year: '',
    contributorName: '',
  })
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

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
    setError('')
    if (!file) return setFileError('Please select a file to upload.')

    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val) formData.append(key, val)
    })
    formData.append('file', file)

    setLoading(true)
    try {
      await submitDocument(formData)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="card p-10">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Thank you for your contribution. Your document is under review and will appear on the
            platform once approved by our admin team.
          </p>
          <button
            onClick={() => {
              setSubmitted(false)
              setForm({ title: '', description: '', subject: '', category: '', year: '', contributorName: '' })
              setFile(null)
            }}
            className="btn-primary"
          >
            Submit Another Document
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload a Document</h1>
        <p className="text-gray-500">
          Share academic resources with students across Rwanda. All uploads are reviewed before publishing.
        </p>
      </div>

      <div className="card p-8">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="title">Document Title *</label>
            <input
              id="title" name="title" type="text" required
              value={form.title} onChange={handleChange}
              placeholder="e.g. Mathematics P2 Past Paper 2023"
              className="input"
            />
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description" name="description" rows={3}
              value={form.description} onChange={handleChange}
              placeholder="Brief description of the document..."
              className="input resize-none"
            />
          </div>

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
              <select id="category" name="category" required value={form.category} onChange={handleChange} className="input">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="year">Year *</label>
              <select id="year" name="year" required value={form.year} onChange={handleChange} className="input">
                <option value="">Select year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="contributorName">Your Name (optional)</label>
              <input
                id="contributorName" name="contributorName" type="text"
                value={form.contributorName} onChange={handleChange}
                placeholder="Leave blank to stay anonymous" className="input"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="file">Upload File *</label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                fileError
                  ? 'border-red-300 bg-red-50'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <input id="file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
              <label htmlFor="file" className="cursor-pointer block">
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
            {fileError && <p className="mt-1.5 text-xs text-red-600">{fileError}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Submit Document
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Uploaded documents are reviewed before being published. Submissions that violate academic integrity may be rejected.
          </p>
        </form>
      </div>
    </div>
  )
}

export default UploadPage
