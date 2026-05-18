import axios from 'axios';

const BASE = '/api/sessions';

export const getSessions = (params) => axios.get(BASE, { params });
export const getSession = (id) => axios.get(`${BASE}/${id}`);
export const createSession = (data) => axios.post(BASE, data);
export const updateSession = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteSession = (id) => axios.delete(`${BASE}/${id}`);
export const joinSession = (id) => axios.post(`${BASE}/${id}/join`);
export const leaveSession = (id) => axios.delete(`${BASE}/${id}/leave`);
export const getMySessions = () => axios.get(`${BASE}/my`);
export const getSubjects = () => axios.get(`${BASE}/subjects`);
