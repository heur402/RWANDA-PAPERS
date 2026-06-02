import API from './axios';

export const submitDocument = (formData) =>
  API.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
