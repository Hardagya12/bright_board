import api from '../api';

export const getPaymentsSummary = () => api.get('/payments/summary');
export const listTransactions = (params) => api.get('/payments/transactions', { params });
export const addPayment = (payload) => api.post('/payments', payload);