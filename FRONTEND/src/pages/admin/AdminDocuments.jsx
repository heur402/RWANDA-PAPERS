import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Check, X, Trash2, Edit, Search, FileText, ExternalLink } from 'lucide-react'
import {
  getAdminDocuments, approveDocument, rejectDocument, deleteDocument, editDocument,
} from '../../api/admin.js'
import { getCategories } from '../../api/categories.js'
import Pagination from '../../components/common/Pagination.jsx'
import Spinner from '../../components/common/Spinner.jsx'

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected']

const EditModal = ({ doc, categories, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: doc.title,
    description: doc.description || '',
    subject: doc.subject,
    category: doc.category?._id || '',
    year: doc.year,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(doc._id, form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-gray-900">Edit Document</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Subject</label>
              <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Year</label>
            <input className="input" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AdminDocuments = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [documents, setDocuments] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editDoc, setEditDoc] = useState(null)

  const activeTab = searchParams.get('status') || 'all'
  const currentPage = Number(searchParams.get('page')) || 1

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data)).catch(() => {})
  }, [])

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 15 }
      if (activeTab !== 'all') params.status = activeTab
      if (search) params.search = search
      const { data } = await getAdminDocuments(params)
      setDocuments(data.data)
      setPagination(data.pagination)
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [currentPage, activeTab, search])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleTabChange = (tab) => {
    const p = new URLSearchParams()
    if (tab !== 'all') p.set('status', tab)
    p.set('page', '1')
    setSearchParams(p)
  }

  const handleApprove = async (id) => {
    try { await approveDocument(id); toast.success('Document approved'); fetchDocs() }
    catch { toast.error('Failed to approve') }
  }

  const handleReject = async (id) => {
    try { await rejectDocument(id); toast.success('Document rejected'); fetchDocs() }
    catch { toast.error('Failed to reject') }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try { await deleteDocument(id); toast.success('Document deleted'); fetchDocs() }
    catch { toast.error('Failed to delete') }
  }

  const handleEdit = async (id, data) => {
    try { await editDocument(id, data); toast.success('Document updated'); fetchDocs() }
    catch { toast.error('Failed to update') }
  }

  return (
    <div className="space-y-6">
      {editDoc && (
        <EditModal doc={editDoc} categories={categories} onSave={handleEdit} onClose={() => setEditDoc(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} total documents</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDocs()}
              className="input pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : documents.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No documents found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Document</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Year</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {/* Title — opens via our /preview endpoint (bypasses IDM) */}
                      <a
                        href={`/api/documents/${doc._id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 font-medium text-gray-900 hover:text-primary-600 transition-colors"
                        title="Open file in new tab"
                      >
                        <span className="line-clamp-1">{doc.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.subject} · {doc.contributorName}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-gray-600">{doc.category?.name || '-'}</td>
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-600">{doc.year}</td>
                    <td className="px-4 py-4">
                      <span className={`badge-${doc.status}`}>{doc.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {doc.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(doc._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleReject(doc._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Reject"><X className="w-4 h-4" /></button>
                          </>
                        )}
                        {doc.status === 'rejected' && (
                          <button onClick={() => handleApprove(doc._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><Check className="w-4 h-4" /></button>
                        )}
                        {doc.status === 'approved' && (
                          <button onClick={() => handleReject(doc._id)} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg" title="Revoke"><X className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => setEditDoc(doc)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(doc._id, doc.title)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(p) => {
          const np = new URLSearchParams(searchParams)
          np.set('page', p)
          setSearchParams(np)
        }}
      />
    </div>
  )
}

export default AdminDocuments
