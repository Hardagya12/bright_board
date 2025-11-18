import api from '../api';

export const listTutorResults = (params) => api.get('/tutor/results', { params });
export const getResultsAnalytics = () => api.get('/tutor/results/analytics');
export const listStudentResults = (params) => api.get('/student/results', { params });
export const getStudentResultsAnalytics = () => api.get('/student/results/analytics');