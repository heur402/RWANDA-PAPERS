import API from './axios'

// Auth
export const loginAdmin = (credentials) => API.post('/admin/login', credentials)
export const signupAdmin = (data) => API.post('/admin/signup', data)

// Profile
export const getAdminProfile = () => API.get('/admin/me')
export const updateAdminProfile = (data) => API.put('/admin/profile', data)
export const changeAdminPassword = (data) => API.put('/admin/password', data)

// Stats
export const getDashboardStats = () => API.get('/admin/stats')

// Documents
export const adminUploadDocument = (formData) =>
  API.post('/admin/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getAdminDocuments = (params) => API.get('/admin/documents', { params })
export const approveDocument = (id) => API.put(`/admin/documents/${id}/approve`)
export const rejectDocument = (id) => API.put(`/admin/documents/${id}/reject`)
export const deleteDocument = (id) => API.delete(`/admin/documents/${id}`)
export const editDocument = (id, data) => API.put(`/admin/documents/${id}`, data)
