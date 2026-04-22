import api from '../api';

// ─── Tutor Endpoints ────────────────────────────────────────────────────────
export const createExam = (payload) => api.post('/tutor/exams', payload);
export const listExamsTutor = (params) => api.get('/tutor/exams', { params });
export const getExamTutor = (id) => api.get(`/tutor/exams/${id}`);
export const updateExam = (id, payload) => api.put(`/tutor/exams/${id}`, payload);
export const updateExamStatus = (id, status) => api.put(`/tutor/exams/${id}/status`, { status });
export const deleteExam = (id) => api.delete(`/tutor/exams/${id}`);

// Questions
export const addQuestion = (id, payload) => api.post(`/tutor/exams/${id}/questions`, payload);
export const updateQuestion = (id, qid, payload) => api.put(`/tutor/exams/${id}/questions/${qid}`, payload);
export const reorderQuestions = (id, order) => api.put(`/tutor/exams/${id}/questions-order`, { order });
export const deleteQuestion = (id, qid) => api.delete(`/tutor/exams/${id}/questions/${qid}`);

// ─── Student Endpoints ──────────────────────────────────────────────────────
export const listExamsStudent = (params) => api.get('/student/exams', { params });
export const getExamStudent = (id) => api.get(`/student/exams/${id}`);
export const startExam = (id) => api.post(`/student/exams/${id}/start`);
export const submitExam = (id, payload) => api.post(`/student/exams/${id}/submit`, payload);