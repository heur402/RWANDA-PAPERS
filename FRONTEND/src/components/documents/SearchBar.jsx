import React, { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const SearchBar = ({ onSearch, categories = [], initialValues = {} }) => {
  const [search, setSearch] = useState(initialValues.search || '')
  const [category, setCategory] = useState(initialValues.category || '')
  const [year, setYear] = useState(initialValues.year || '')
  const [subject, setSubject] = useState(initialValues.subject || '')
  const [showFilters, setShowFilters] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch({ search, category, year, subject })
  }

  const handleClear = () => {
    setSearch('')
    setCategory('')
    setYear('')
    setSubject('')
    onSearch({})
  }

  const hasFilters = category || year || subject

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
            aria-label="Search documents"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors shadow-sm ${
            hasFilters
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && (
            <span className="w-5 h-5 bg-white text-primary-600 rounded-full text-xs flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
        <button type="submit" className="btn-primary px-6 rounded-xl shadow-sm">
          Search
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="input"
            />
          </div>
          <div>
            <label className="label">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="input">
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

export default SearchBar
