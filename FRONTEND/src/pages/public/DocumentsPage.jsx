import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileSearch, ChevronLeft, ChevronRight } from 'lucide-react'
import { getDocuments } from '../../api/documents.js'
import { getCategories } from '../../api/categories.js'
import DocumentCard from '../../components/documents/DocumentCard.jsx'
import SearchBar from '../../components/documents/SearchBar.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import Spinner from '../../components/common/Spinner.jsx'

const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [documents, setDocuments] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  const currentPage    = Number(searchParams.get('page')) || 1
  const searchQuery    = searchParams.get('search') || ''
  const categoryFilter = searchParams.get('category') || ''
  const yearFilter     = searchParams.get('year') || ''
  const subjectFilter  = searchParams.get('subject') || ''

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = { page: currentPage, limit: 12 }
        if (searchQuery)    params.search   = searchQuery
        if (categoryFilter) params.category = categoryFilter
        if (yearFilter)     params.year     = yearFilter
        if (subjectFilter)  params.subject  = subjectFilter

        const { data } = await getDocuments(params)
        setDocuments(data.data)
        setPagination(data.pagination)
      } catch {
        setError('Failed to load documents. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [currentPage, searchQuery, categoryFilter, yearFilter, subjectFilter])

  const handleSearch = useCallback(
    (filters) => {
      const newParams = new URLSearchParams()
      if (filters.search)   newParams.set('search',   filters.search)
      if (filters.category) newParams.set('category', filters.category)
      if (filters.year)     newParams.set('year',     filters.year)
      if (filters.subject)  newParams.set('subject',  filters.subject)
      newParams.set('page', '1')
      setSearchParams(newParams)
    },
    [setSearchParams]
  )

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', page)
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollCards = (dir) => {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector('[data-card]')
    const cardWidth = card?.offsetWidth || 280
    scrollRef.current.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' })
  }

  const activeCategory = categories.find((c) => c._id === categoryFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {activeCategory ? activeCategory.name : 'All Documents'}
        </h1>
        <p className="text-gray-500">
          {loading ? 'Loading...' : `${pagination.total.toLocaleString()} document${pagination.total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="mb-8">
        <SearchBar
          onSearch={handleSearch}
          categories={categories}
          initialValues={{ search: searchQuery, category: categoryFilter, year: yearFilter, subject: subjectFilter }}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20">
          <FileSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No documents found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          {/* ── Mobile: horizontal snap scroll with chevrons ── */}
          <div className="sm:hidden relative">
            <button
              onClick={() => scrollCards(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
                         w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center
                         hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {documents.map((doc) => (
                <div key={doc._id} data-card className="flex-shrink-0 w-[48vw] snap-start">
                  <DocumentCard document={doc} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollCards(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
                         w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center
                         hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* ── Desktop: grid ── */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}

export default DocumentsPage
