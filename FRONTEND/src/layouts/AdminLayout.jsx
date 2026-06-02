import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Tag, LogOut,
  Menu, BookOpen, Upload, UserCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/documents',  label: 'Documents',  icon: FileText },
  { to: '/admin/upload',     label: 'Upload Paper', icon: Upload },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
]

const Sidebar = ({ admin, handleLogout, setSidebarOpen }) => (
  <div className="flex flex-col h-full bg-primary-900 text-white w-64">
    {/* Logo */}
    <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-800">
      <BookOpen className="w-7 h-7 text-yellow-400" />
      <div>
        <p className="font-bold text-lg leading-none">Rwanda Papers</p>
        <p className="text-xs text-primary-400">Admin Panel</p>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary-700 text-white'
                : 'text-primary-300 hover:bg-primary-800 hover:text-white'
            }`
          }
          onClick={() => setSidebarOpen(false)}
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>

    {/* Profile + logout */}
    <div className="px-4 py-4 border-t border-primary-800 space-y-1">
      {/* Avatar — links to profile page */}
      <NavLink
        to="/admin/profile"
        onClick={() => setSidebarOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive ? 'bg-primary-700' : 'hover:bg-primary-800'
          }`
        }
      >
        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {admin?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-sm font-medium truncate">{admin?.name}</p>
          <p className="text-xs text-primary-400 truncate">{admin?.email}</p>
        </div>
        <UserCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
      </NavLink>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-primary-300 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  </div>
)

const AdminLayout = () => {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar admin={admin} handleLogout={handleLogout} setSidebarOpen={setSidebarOpen} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 flex flex-col h-full">
            <Sidebar admin={admin} handleLogout={handleLogout} setSidebarOpen={setSidebarOpen} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-primary-700">Rwanda Papers Admin</span>
          </div>
          <NavLink to="/admin/profile" className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
            {admin?.name?.charAt(0).toUpperCase()}
          </NavLink>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
