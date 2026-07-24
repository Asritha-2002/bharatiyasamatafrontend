import axios from './axios.js'; // adjust to match your existing downloads.js import

const BASE = '/how-to-help';

export function getHowToHelps() {
  return axios.get(BASE);
}

export function addHowToHelp({ title, description, priority, file, links }) {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  if (priority !== undefined && priority !== '') formData.append('priority', priority);
  if (file) formData.append('pdf', file);
  if (links) formData.append('links', JSON.stringify(links));

  return axios.post(BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function updateHowToHelp(id, fields) {
  const formData = new FormData();
  if (fields.title !== undefined) formData.append('title', fields.title);
  if (fields.description !== undefined) formData.append('description', fields.description);
  if (fields.priority !== undefined) formData.append('priority', fields.priority);
  if (fields.file) formData.append('pdf', fields.file);
  if (fields.links !== undefined) formData.append('links', JSON.stringify(fields.links));

  return axios.put(`${BASE}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function deleteHowToHelp(id) {
  return axios.delete(`${BASE}/${id}`);
}

export function reorderHowToHelps(order) {
  return axios.put(`${BASE}/reorder`, { order });
}