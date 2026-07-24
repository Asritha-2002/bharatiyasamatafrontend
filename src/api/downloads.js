import api from './axios.js';

function buildFormData({ title, description, priority, file }) {
  const formData = new FormData();
  if (title !== undefined) formData.append('title', title);
  if (description !== undefined) formData.append('description', description);
  if (priority !== undefined && priority !== '') formData.append('priority', priority);
  if (file) formData.append('pdf', file);
  return formData;
}

export const getDownloads = () => api.get('/downloads');

export const addDownload = (data) =>
  api.post('/downloads', buildFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateDownload = (id, data) =>
  api.put(`/downloads/${id}`, buildFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteDownload = (id) => api.delete(`/downloads/${id}`);

export const reorderDownloads = (order) => api.put('/downloads/reorder', { order });