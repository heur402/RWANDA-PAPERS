import API from './axios'

export const loginAdmin = (credentials) => API.post('/admin/login', credentials)
export const signupAdmin = (data) => API.post('/admin/signup', data)
export const getAdminProfile = () => API.get('/admin/me')
export const getDashboardStats = () => API.get('/admin/stats')
export const getAdminDocuments = (params) => API.get('/admin/documents', { params })
export const approveDocument = (id) => API.put(`/admin/documents/${id}/approve`)
export const rejectDocument = (id) => API.put(`/admin/documents/${id}/reject`)
export const deleteDocument = (id) => API.delete(`/admin/documents/${id}`)
export const editDocument = (id, data) => API.put(`/admin/documents/${id}`, data)
