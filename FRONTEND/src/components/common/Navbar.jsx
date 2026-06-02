import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Search, Menu, X, Upload, Bookmark } from 'lucide-react'
import useSavedDocs from '../../hooks/useSavedDocs.js'

const Navbar = () => {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled]       = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { saved } = useSavedDocs()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onDocuments = location.pathname === '/documents' || location.pathname.startsWith('/documents/')
  const showSearch  = !onDocuments && (location.pathname === '/upload' || scrolled)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/documents?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMenuOpen(false)
    }
  }

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/documents', label: 'Documents' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary-700 block">Rwanda Papers</span>
          </Link>

          {/* Desktop search — slides in */}
          <form
            onSubmit={handleSearch}
            className={`hidden md:flex flex-1 transition-all duration-300 overflow-hidden ${
              showSearch ? 'opacity-100 max-w-lg' : 'opacity-0 max-w-0 pointer-events-none'
            }`}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Saved — with badge */}
            <NavLink
              to="/saved"
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                }`
              }
            >
              <Bookmark className="w-4 h-4" />
              Saved
              {saved.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {saved.length > 99 ? '99+' : saved.length}
                </span>
              )}
            </NavLink>

            <Link
              to="/upload"
              className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Contribute
            </Link>
          </nav>

          {/* Mobile: saved badge + menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <NavLink to="/saved" className="relative p-2 rounded-lg hover:bg-gray-100" aria-label="Saved">
              <Bookmark className="w-5 h-5 text-gray-600" />
              {saved.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {saved.length > 9 ? '9+' : saved.length}
                </span>
              )}
            </NavLink>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 pb-4">
            <form onSubmit={handleSearch} className="px-2 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </form>
            <nav className="space-y-1 px-2">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/saved"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" /> Saved
                </span>
                {saved.length > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {saved.length}
                  </span>
                )}
              </NavLink>
              <Link
                to="/upload"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg"
              >
                <Upload className="w-4 h-4" /> Contribute
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
