import api from '../api';

export const listMaterials = (params) => api.get('/materials', { params });
export const createMaterial = (payload) => api.post('/materials', payload);
export const updateMaterialMetrics = (id, payload) => api.put(`/materials/${id}/metrics`, payload);