import api from '../api';

// Tutor
export const listTutorResults = (params) => api.get('/tutor/results', { params });
export const getResultsAnalytics = () => api.get('/tutor/results/analytics');
export const getAnswerReview = (attemptId) => api.get(`/tutor/results/${attemptId}/answers`);
export const getLeaderboard = (examId) => api.get(`/tutor/results/leaderboard/${examId}`);

// Student
export const listStudentResults = (params) => api.get('/student/results', { params });
export const getStudentResultsAnalytics = () => api.get('/student/results/analytics');
export const getStudentAnswerReview = (attemptId) => api.get(`/student/results/${attemptId}/answers`);