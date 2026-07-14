import api from './axios.js';

export const getRevenueOverview = () => api.get('/admin/revenue');