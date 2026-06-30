import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const postDossier = {
  createAllergie: async (patientId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/patients/${patientId}/allergies`, payload, { headers: auth() });
    return data;
  },
  createTraitement: async (patientId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/patients/${patientId}/traitements`, payload, { headers: auth() });
    return data;
  },
  createContact: async (patientId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/patients/${patientId}/contacts`, payload, { headers: auth() });
    return data;
  },
  createCouverture: async (patientId: string, payload: any) => {
    const { data } = await axios.post(`${BASE}/patients/${patientId}/couvertures`, payload, { headers: auth() });
    return data;
  },
};
