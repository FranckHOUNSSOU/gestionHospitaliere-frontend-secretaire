import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const getAuth = {
  getProfil: async () => {
    const { data } = await axios.get(`${BASE}/auth/profil`, { headers: auth() });
    return data;
  },
  getMedecins: async (params: any) => {
    const { data } = await axios.get(`${BASE}/auth/users`, { params, headers: auth() });
    return data;
  },
  getServices: async (poleId: string) => {
    const { data } = await axios.get(`${BASE}/services`, { params: { poleId }, headers: auth() });
    return data;
  },
  getChambres: async (serviceId: string) => {
    const { data } = await axios.get(`${BASE}/chambres/service/${serviceId}`, { headers: auth() });
    return data;
  },
};
