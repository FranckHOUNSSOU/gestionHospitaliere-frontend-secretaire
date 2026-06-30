import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const getDossier = {
  getDossier: async (patientId: string) => {
    const { data } = await axios.get(`${BASE}/patients/${patientId}/dossier`, { headers: auth() });
    return data;
  },
  getSejourActif: async (patientId: string) => {
    const { data } = await axios.get(`${BASE}/sejours/patient/${patientId}/actif`, { headers: auth() });
    return data;
  },
  getSejourDetail: async (sejourId: string) => {
    const { data } = await axios.get(`${BASE}/sejours/${sejourId}`, { headers: auth() });
    return data;
  },
};
