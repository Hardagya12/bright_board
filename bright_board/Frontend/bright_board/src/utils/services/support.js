import api from '../api';

export const listTickets = (params) => api.get('/support', { params });
export const createTicket = (payload) => api.post('/support', payload);
export const getTicket = (id) => api.get(`/support/${id}`);
export const addReply = (id, payload) => api.post(`/support/${id}/replies`, payload);
export const updateStatus = (id, payload) => api.put(`/support/${id}/status`, payload);