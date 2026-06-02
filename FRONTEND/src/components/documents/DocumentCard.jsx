import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, Download, Calendar, Tag, User } from 'lucide-react'

const DocumentCard = ({ document }) => {
  const { _id, title, subject, category, year, downloads, contributorName, fileType } = document

  return (
    <Link
      to={`/documents/${_id}`}
      className="card group flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* File type colour bar */}
      <div className={`h-2 ${fileType === 'pdf' ? 'bg-red-500' : 'bg-blue-500'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Icon + badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded uppercase ${
              fileType === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {fileType}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Subject */}
        <p className="text-xs text-gray-500 mb-3">{subject}</p>

        <div className="flex-1" />

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-gray-500">
          {category?.name && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>{category.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span>{downloads?.toLocaleString()}</span>
            </div>
          </div>
          {contributorName && contributorName !== 'Anonymous' && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <User className="w-3.5 h-3.5" />
              <span className="truncate">{contributorName}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default DocumentCard
