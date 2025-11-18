import api from '../api';

export const listBatches = (params) => api.get('/batches', { params });
export const getBatch = (id) => api.get(`/batches/${id}`);
export const createBatch = (payload) => api.post('/batches', payload);
export const updateBatch = (id, payload) => api.put(`/batches/${id}`, payload);
export const deleteBatch = (id) => api.delete(`/batches/${id}`);