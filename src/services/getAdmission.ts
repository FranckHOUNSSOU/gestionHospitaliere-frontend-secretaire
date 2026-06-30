import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const getAdmission = {
  getStats: async () => {
    const { data } = await axios.get(`${BASE}/admissions/stats`, { headers: auth() });
    return data;
  },
  rechercher: async (params: any) => {
    const { data } = await axios.get(`${BASE}/admissions/recherche`, { params, headers: auth() });
    return data;
  },
};
