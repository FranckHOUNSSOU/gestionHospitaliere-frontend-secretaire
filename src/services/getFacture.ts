import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL ?? '/api';
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` });

export const getFacture = {
  getFactures: async () => {
    const { data } = await axios.get(`${BASE}/facturation/factures`, { headers: auth() });
    return data;
  },
  getApercuFacture: async (patientId: string) => {
    const { data } = await axios.get(`${BASE}/facturation/apercu/${patientId}`, { headers: auth() });
    return data;
  },
};
