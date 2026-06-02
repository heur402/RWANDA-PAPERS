import API from './axios';

export const getDocuments = (params) => API.get('/documents', { params });
export const getDocument = (id) => API.get(`/documents/${id}`);
export const getFeaturedDocuments = () => API.get('/documents/featured');
export const getLatestDocuments = () => API.get('/documents/latest');
export const downloadDocument = (id) => API.get(`/documents/${id}/download`, { responseType: 'blob' });
