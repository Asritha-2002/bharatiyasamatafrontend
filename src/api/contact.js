import api from './axios.js';

export const submitContactMessage = ({ name, mobile, email, message }) =>
  api.post('/contact', { name, mobile, email, message });

// Admin-only
export const getContactMessages = () => api.get('/contact');
export const markContactMessageRead = (id) => api.patch(`/contact/${id}/read`);
export const deleteContactMessage = (id) => api.delete(`/contact/${id}`);