import api from '../api';

export const getInstituteProfile = () => api.get('/institutes/profile');
export const updateInstituteProfile = (payload) => api.put('/institutes/profile', payload);