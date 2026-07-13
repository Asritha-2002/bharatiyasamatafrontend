import api from './axios.js';

export const getGallery = () => api.get('/gallery');

export const addGalleryImage = (file, caption = '') => {
  const formData = new FormData();
  formData.append('image', file);
  if (caption) formData.append('caption', caption);
  return api.post('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// file is optional -- pass it only when replacing the image itself
export const updateGalleryImage = (id, { file, caption } = {}) => {
  const formData = new FormData();
  if (file) formData.append('image', file);
  if (caption !== undefined) formData.append('caption', caption);
  return api.put(`/gallery/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteGalleryImage = (id) => api.delete(`/gallery/${id}`);

// order: full array of image _ids in the new desired sequence
export const reorderGallery = (order) => api.put('/gallery/reorder', { order });