import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <Spinner fullScreen />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}

export default ProtectedRoute
