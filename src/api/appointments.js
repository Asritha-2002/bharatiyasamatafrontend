import api from './axios.js';

function buildFormData({ title, description, priority, links, file }) {
  const formData = new FormData();
  if (title !== undefined) formData.append('title', title);
  if (description !== undefined) formData.append('description', description);
  if (priority !== undefined && priority !== '') formData.append('priority', priority);
  if (links !== undefined) formData.append('links', JSON.stringify(links));
  if (file) formData.append('image', file);
  return formData;
}

export const getAppointments = () => api.get('/appointments');

export const addAppointment = (data) =>
  api.post('/appointments', buildFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateAppointment = (id, data) =>
  api.put(`/appointments/${id}`, buildFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

export const reorderAppointments = (order) => api.put('/appointments/reorder', { order });