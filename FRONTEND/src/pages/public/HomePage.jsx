import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, BookOpen, ArrowRight,
  GraduationCap, School, Wrench, FileText, ClipboardList,
  BookMarked, PenTool, Layers, FlaskConical, Bookmark,
} from 'lucide-react'
import { getDocuments } from '../../api/documents.js'
import { getCategories } from '../../api/categories.js'
import DocumentCard from '../../components/documents/DocumentCard.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import ScrollRow from '../../components/common/ScrollRow.jsx'
import useSavedDocs from '../../hooks/useSavedDocs.js'

// ── Category icon + colour maps ───────────────────────────────────────────────
const categoryIcons = {
  'Primary School': School,
  'Secondary School': GraduationCap,
  'TVET': Wrench,
  'University': BookOpen,
  'National Exams': ClipboardList,
  'Notes': BookMarked,
  'Assignments': PenTool,
  'Modules': Layers,
  'Research Papers': FlaskConical,
}
const categoryColors = [
  'bg-blue-50 text-blue-600',
  'bg-green-50 text-green-600',
  'bg-purple-50 text-purple-600',
  'bg-orange-50 text-orange-600',
  'bg-red-50 text-red-600',
  'bg-cyan-50 text-cyan-600',
  'bg-pink-50 text-pink-600',
  'bg-indigo-50 text-indigo-600',
  'bg-yellow-50 text-yellow-600',
]

// ── Single category row using smart ScrollRow ────────────────────────────────
const CategoryRow = ({ category, documents, colorClass }) => {
  const Icon = categoryIcons[category.name] || FileText
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
            <p className="text-xs text-gray-400">{documents.length} recent upload{documents.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Link to={`/documents?category=${category._id}`}
          className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700 flex-shrink-0">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <ScrollRow>
        {documents.map((doc) => (
          <div key={doc._id} data-card className="flex-shrink-0 snap-start w-[48vw] sm:w-56 md:w-60 lg:w-64">
            <DocumentCard document={doc} />
          </div>
        ))}
      </ScrollRow>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [categoryDocs, setCategoryDocs] = useState({})
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const { saved } = useSavedDocs()

  useEffect(() => {
    getCategories()
      .then((res) => {
        const cats = res.data.data
        setCategories(cats)
        setLoadingCategories(false)

        // Fetch latest 10 docs per category in parallel
        return Promise.all(
          cats.map((cat) =>
            getDocuments({ category: cat._id, limit: 10, page: 1 })
              .then((r) => ({ id: cat._id, docs: r.data.data }))
              .catch(() => ({ id: cat._id, docs: [] }))
          )
        )
      })
      .then((results) => {
        const map = {}
        results.forEach(({ id, docs }) => { map[id] = docs })
        setCategoryDocs(map)
        setLoadingDocs(false)
      })
      .catch(() => {
        setLoadingCategories(false)
        setLoadingDocs(false)
      })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/documents?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Only show categories that have at least one doc
  const activeCategories = categories.filter(
    (cat) => categoryDocs[cat._id]?.length > 0
  )

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Rwanda's Academic Resource Hub
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Access Past Papers &<br />
              <span className="text-yellow-400">Academic Resources</span>
            </h1>
            <p className="text-primary-200 text-lg sm:text-xl mb-10 leading-relaxed">
              Thousands of past papers, notes, assignments, and modules from Rwanda's schools,
              TVET institutions, and universities — all in one place.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, subject, category..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-primary-200">
              {['Past Papers', 'Study Notes', 'Assignments', 'Modules', 'Research Papers'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/documents?search=${encodeURIComponent(tag)}`)}
                  className="hover:text-white transition-colors"
                >
                  #{tag.replace(' ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Saved Documents (shown only when user has saved some) ───────────── */}
      {saved.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-primary-600 fill-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Saved Documents</h2>
                <p className="text-xs text-gray-400">{saved.length} saved</p>
              </div>
            </div>
            <Link to="/saved" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ScrollRow>
            {saved.map((doc) => (
              <div key={doc._id} data-card className="flex-shrink-0 snap-start w-[48vw] sm:w-56 md:w-60 lg:w-64">
                <DocumentCard document={doc} />
              </div>
            ))}
          </ScrollRow>
        </section>
      )}

      {/* ── Browse Categories ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Categories</h2>
            <p className="text-gray-500 mt-1">Find resources by education level or type</p>
          </div>
          <Link
            to="/documents"
            className="hidden sm:flex items-center gap-1.5 text-primary-600 font-medium hover:text-primary-700 transition-colors text-sm"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingCategories ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat, idx) => {
              const Icon = categoryIcons[cat.name] || FileText
              const color = categoryColors[idx % categoryColors.length]
              return (
                <Link
                  key={cat._id}
                  to={`/documents?category=${cat._id}`}
                  className="card p-5 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-500">{cat.documentCount ?? 0} docs</p>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Latest Uploads by Category ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loadingDocs ? (
            <Spinner />
          ) : activeCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No documents yet.</p>
          ) : (
            activeCategories.map((cat, idx) => (
              <CategoryRow
                key={cat._id}
                category={cat}
                documents={categoryDocs[cat._id]}
                colorClass={categoryColors[idx % categoryColors.length]}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
