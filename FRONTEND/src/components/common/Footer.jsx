import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Globe } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Rwanda Papers</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your one-stop hub for academic resources from Rwanda schools, TVET institutions, and universities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/documents" className="hover:text-white transition-colors">Browse Documents</Link></li>
              <li><Link to="/upload" className="hover:text-white transition-colors">Upload a Document</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {['Primary School', 'Secondary School', 'TVET', 'University', 'National Exams'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/documents?search=${encodeURIComponent(cat)}`}
                    className="hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} Rwanda Papers. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <Globe className="w-4 h-4" /> Made in Rwanda 🇷🇼
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
