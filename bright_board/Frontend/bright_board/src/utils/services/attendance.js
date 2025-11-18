import api from '../api';

export const listAttendance = (params) => api.get('/attendance', { params });
export const uploadAttendanceBulk = (payload) => api.post('/attendance/bulk', payload);
export const getAttendanceStats = (params) => api.get('/attendance/stats', { params });