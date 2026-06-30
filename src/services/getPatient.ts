import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const getPatient = {
  findAll: async (q?: string) => {
    const { data } = await axios.get(`${BASE}/patients`, { params: q ? { q } : {}, headers: auth() });
    return data;
  },
  rechercher: async (q: string) => {
    const { data } = await axios.get(`${BASE}/patients/recherche?q=${encodeURIComponent(q.trim())}`, { headers: auth() });
    return data;
  },
  findOne: async (id: string) => {
    const { data } = await axios.get(`${BASE}/patients/${id}`, { headers: auth() });
    return data;
  },
};
