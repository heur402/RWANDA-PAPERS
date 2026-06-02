import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Plus, Edit, Trash2, X, Tag } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories.js'
import Spinner from '../../components/common/Spinner.jsx'

const CategoryModal = ({ category, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-gray-900">{category ? 'Edit Category' : 'New Category'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="input" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Secondary School"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none" rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await getCategories()
      setCategories(data.data)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSave = async (form) => {
    try {
      if (modal === 'create') {
        await createCategory(form)
        toast.success('Category created')
      } else {
        await updateCategory(modal._id, form)
        toast.success('Category updated')
      }
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
      throw err
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
      fetchCategories()
    } catch {
      toast.error('Failed to delete category')
    }
  }

  return (
    <div className="space-y-6">
      {modal && (
        <CategoryModal
          category={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No categories yet</p>
          <button onClick={() => setModal('create')} className="btn-primary">Create First Category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
              {cat.description && <p className="text-sm text-gray-500 flex-1">{cat.description}</p>}
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                {cat.documentCount ?? 0} document{cat.documentCount !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminCategories
