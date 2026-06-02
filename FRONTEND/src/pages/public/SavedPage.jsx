import React from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Trash2, BookOpen } from 'lucide-react'
import DocumentCard from '../../components/documents/DocumentCard.jsx'
import ScrollRow from '../../components/common/ScrollRow.jsx'
import useSavedDocs from '../../hooks/useSavedDocs.js'

const SavedPage = () => {
  const { saved, unsave } = useSavedDocs()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary-600 fill-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Documents</h1>
            <p className="text-sm text-gray-500">{saved.length} document{saved.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
        {saved.length > 0 && (
          <Link to="/documents" className="text-sm text-primary-600 font-medium hover:text-primary-700">
            Browse more →
          </Link>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved documents yet</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Click the bookmark icon on any document card to save it here for quick access.
          </p>
          <Link to="/documents" className="btn-primary">
            <BookOpen className="w-4 h-4" /> Browse Documents
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: smart scroll row */}
          <div className="sm:hidden mb-8">
            <ScrollRow>
              {saved.map((doc) => (
                <div key={doc._id} data-card className="flex-shrink-0 w-[48vw] snap-start">
                  <DocumentCard document={doc} />
                </div>
              ))}
            </ScrollRow>
          </div>

          {/* Desktop: grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {saved.map((doc) => <DocumentCard key={doc._id} document={doc} />)}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => { if (window.confirm('Clear all saved documents?')) saved.forEach((d) => unsave(d._id)) }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear all saved
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SavedPage
