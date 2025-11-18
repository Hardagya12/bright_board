import api from '../api';

export const listStudents = (params) => api.get('/students', { params });
export const getStudent = (id) => api.get(`/students/${id}`);