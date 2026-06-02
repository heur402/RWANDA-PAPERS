import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Download, BookOpen, ArrowRight, TrendingUp, Clock,
  GraduationCap, School, Wrench, FileText, ClipboardList,
  BookMarked, PenTool, Layers, FlaskConical,
} from 'lucide-react'
import { getFeaturedDocuments, getLatestDocuments } from '../../api/documents.js'
import { getCategories } from '../../api/categories.js'
import DocumentCard from '../../components/documents/DocumentCard.jsx'
import Spinner from '../../components/common/Spinner.jsx'

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

const HomePage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingLatest, setLoadingLatest] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    getFeaturedDocuments()
      .then((res) => setFeatured(res.data.data))
      .finally(() => setLoadingFeatured(false))

    getLatestDocuments()
      .then((res) => setLatest(res.data.data))
      .finally(() => setLoadingLatest(false))

    getCategories()
      .then((res) => setCategories(res.data.data))
      .finally(() => setLoadingCategories(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/documents?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div>
      {/* ── Hero ── */}
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

      {/* ── Categories ── */}
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

      {/* ── Most Downloaded ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-medium text-sm mb-1">
                <TrendingUp className="w-4 h-4" /> Most Popular
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Top Downloaded Documents</h2>
            </div>
            <Link to="/documents" className="hidden sm:flex items-center gap-1.5 text-primary-600 font-medium hover:text-primary-700 text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <Spinner />
          ) : featured.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No documents yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.slice(0, 8).map((doc) => (
                <DocumentCard key={doc._id} document={doc} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Latest Uploads ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm mb-1">
              <Clock className="w-4 h-4" /> Recently Added
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Uploads</h2>
          </div>
          <Link to="/documents" className="hidden sm:flex items-center gap-1.5 text-primary-600 font-medium hover:text-primary-700 text-sm">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingLatest ? (
          <Spinner />
        ) : latest.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No documents yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {latest.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Resources to Share?</h2>
          <p className="text-primary-200 text-lg mb-8">
            Help fellow students by uploading past papers, notes, or assignments.
            Your contribution will be reviewed and published.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-colors shadow-lg"
          >
            <Download className="w-5 h-5 rotate-180" />
            Upload a Document
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
