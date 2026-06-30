import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const postSejour = {
  createSejour: async (patientId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/sejours/patient/${patientId}`, payload, { headers: auth() });
    return data;
  },
  createMouvement: async (sejourId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/sejours/${sejourId}/mouvements`, payload, { headers: auth() });
    return data;
  },
  createSoin: async (sejourId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/sejours/${sejourId}/soins`, payload, { headers: auth() });
    return data;
  },
  createDiagnostic: async (sejourId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/sejours/${sejourId}/diagnostics`, payload, { headers: auth() });
    return data;
  },
};
