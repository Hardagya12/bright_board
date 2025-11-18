import api from '../api';

export const createExam = (payload) => api.post('/tutor/exams', payload);
export const listExamsTutor = () => api.get('/tutor/exams');
export const getExamTutor = (id) => api.get(`/tutor/exams/${id}`);
export const updateExam = (id, payload) => api.put(`/tutor/exams/${id}`, payload);
export const deleteExam = (id) => api.delete(`/tutor/exams/${id}`);
export const addQuestion = (id, payload) => api.post(`/tutor/exams/${id}/questions`, payload);
export const updateQuestion = (id, qid, payload) => api.put(`/tutor/exams/${id}/questions/${qid}`, payload);
export const deleteQuestion = (id, qid) => api.delete(`/tutor/exams/${id}/questions/${qid}`);

export const listExamsStudent = (params) => api.get('/student/exams', { params });
export const getExamStudent = (id) => api.get(`/student/exams/${id}`);
export const submitExam = (id, payload) => api.post(`/student/exams/${id}/submit`, payload);