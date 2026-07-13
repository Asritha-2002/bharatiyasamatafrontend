import api from './axios.js';

export const getBlogs = () => api.get('/blogs');
export const getBlogById = (id) => api.get(`/blogs/${id}`);

// file is optional
export const addBlog = ({ title, sku, description, priority, file }) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('sku', sku);
  formData.append('description', description);
  if (priority !== undefined && priority !== '') formData.append('priority', priority);
  if (file) formData.append('image', file);
  return api.post('/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateBlog = (id, { title, sku, description, priority, file } = {}) => {
  const formData = new FormData();
  if (title !== undefined) formData.append('title', title);
  if (sku !== undefined) formData.append('sku', sku);
  if (description !== undefined) formData.append('description', description);
  if (priority !== undefined && priority !== '') formData.append('priority', priority);
  if (file) formData.append('image', file);
  return api.put(`/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteBlog = (id) => api.delete(`/blogs/${id}`);

export const reorderBlogs = (order) => api.put('/blogs/reorder', { order });