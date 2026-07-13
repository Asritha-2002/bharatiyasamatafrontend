import api from './axios.js';

export const getBanner = () => api.get('/banner');

// Used for both "create" (no banner yet) and "replace" (one exists) --
// the backend upserts either way, so the frontend doesn't need to branch.
export const saveBanner = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.put('/banner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteBanner = () => api.delete('/banner');