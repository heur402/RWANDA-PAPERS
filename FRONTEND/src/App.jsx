import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext.jsx'

// Public pages
import HomePage from './pages/public/HomePage.jsx'
import DocumentsPage from './pages/public/DocumentsPage.jsx'
import DocumentDetailPage from './pages/public/DocumentDetailPage.jsx'
import UploadPage from './pages/public/UploadPage.jsx'
import CategoryPage from './pages/public/CategoryPage.jsx'

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminDocuments from './pages/admin/AdminDocuments.jsx'
import AdminCategories from './pages/admin/AdminCategories.jsx'
import AdminUpload from './pages/admin/AdminUpload.jsx'
import AdminProfile from './pages/admin/AdminProfile.jsx'

// Layouts & guards
import PublicLayout from './layouts/PublicLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/categories/:id" element={<CategoryPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/upload" element={<AdminUpload />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
