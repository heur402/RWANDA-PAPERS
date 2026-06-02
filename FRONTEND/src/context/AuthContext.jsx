import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  loginAdmin as loginAdminAPI,
  signupAdmin as signupAdminAPI,
  updateAdminProfile as updateAdminProfileAPI,
} from '../api/admin.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rp_token')
    const stored = localStorage.getItem('rp_admin')
    if (token && stored) {
      try {
        setAdmin(JSON.parse(stored))
      } catch {
        localStorage.removeItem('rp_admin')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await loginAdminAPI({ email, password })
    localStorage.setItem('rp_token', data.token)
    localStorage.setItem('rp_admin', JSON.stringify(data.admin))
    setAdmin(data.admin)
    return data
  }

  const signup = async (name, email, password) => {
    const { data } = await signupAdminAPI({ name, email, password })
    localStorage.setItem('rp_token', data.token)
    localStorage.setItem('rp_admin', JSON.stringify(data.admin))
    setAdmin(data.admin)
    return data
  }

  const logout = () => {
    localStorage.removeItem('rp_token')
    localStorage.removeItem('rp_admin')
    setAdmin(null)
  }

  // Update name/email in state + localStorage after profile save
  const updateProfile = (updatedAdmin) => {
    const merged = { ...admin, ...updatedAdmin }
    localStorage.setItem('rp_admin', JSON.stringify(merged))
    setAdmin(merged)
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, signup, logout, updateProfile, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
