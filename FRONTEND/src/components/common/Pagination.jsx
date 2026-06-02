import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const left = currentPage - delta
  const right = currentPage + delta + 1

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      pages.push(i)
    }
  }

  const withEllipsis = []
  let prev
  for (const page of pages) {
    if (prev && page - prev > 1) withEllipsis.push('...')
    withEllipsis.push(page)
    prev = page
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {withEllipsis.map((item, idx) =>
        item === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500 select-none">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
              item === currentPage
                ? 'bg-primary-600 text-white'
                : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
            }`}
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

export default Pagination
